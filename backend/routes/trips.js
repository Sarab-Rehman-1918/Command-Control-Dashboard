const express = require('express');
const pool = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all trips
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, r.route_name, r.start_point, r.end_point
      FROM trips t
      LEFT JOIN routes r ON t.route_id = r.route_id
      ORDER BY t.trip_id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get trip by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT t.*, r.route_name, r.start_point, r.end_point
      FROM trips t
      LEFT JOIN routes r ON t.route_id = r.route_id
      WHERE t.trip_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Create new trip (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, route_id } = req.body;

    const result = await pool.query(
      'INSERT INTO trips (status, route_id) VALUES ($1, $2) RETURNING *',
      [status, route_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Update trip
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, route_id } = req.body;

    const result = await pool.query(
      'UPDATE trips SET status = $1, route_id = $2 WHERE trip_id = $3 RETURNING *',
      [status, route_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete trip (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM trips WHERE trip_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// Get trips by status
router.get('/status/:status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.params;
    const result = await pool.query(`
      SELECT t.*, r.route_name
      FROM trips t
      LEFT JOIN routes r ON t.route_id = r.route_id
      WHERE t.status = $1
      ORDER BY t.trip_id DESC
    `, [status]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get trips by status error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get active/ongoing trips
router.get('/active/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, r.route_name, r.start_point, r.end_point
      FROM trips t
      LEFT JOIN routes r ON t.route_id = r.route_id
      WHERE t.status = 'Ongoing'
      ORDER BY t.trip_id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get active trips error:', error);
    res.status(500).json({ error: 'Failed to fetch active trips' });
  }
});

module.exports = router;