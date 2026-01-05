const express = require('express');
const pool = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all tickets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, tr.status as trip_status, r.route_name
      FROM tickets t
      LEFT JOIN trips tr ON t.trip_id = tr.trip_id
      LEFT JOIN routes r ON tr.route_id = r.route_id
      ORDER BY t.ticket_id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get ticket by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT t.*, tr.status as trip_status, r.route_name
      FROM tickets t
      LEFT JOIN trips tr ON t.trip_id = tr.trip_id
      LEFT JOIN routes r ON tr.route_id = r.route_id
      WHERE t.ticket_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Create new ticket
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, trip_id, seat_number, price, status } = req.body;

    const result = await pool.query(
      'INSERT INTO tickets (user_id, trip_id, seat_number, price, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, trip_id, seat_number, price, status || 'Booked']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, trip_id, seat_number, price, status } = req.body;

    const result = await pool.query(
      'UPDATE tickets SET user_id = $1, trip_id = $2, seat_number = $3, price = $4, status = $5 WHERE ticket_id = $6 RETURNING *',
      [user_id, trip_id, seat_number, price, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Delete ticket (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM tickets WHERE ticket_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

module.exports = router;