const express = require('express');
const pool = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, i.type as incident_type, i.severity, i.bus_id
      FROM alerts a
      LEFT JOIN incidents i ON a.incident_id = i.incident_id
      ORDER BY a.alert_id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT a.*, i.type as incident_type, i.severity, i.bus_id, i.trip_id
      FROM alerts a
      LEFT JOIN incidents i ON a.incident_id = i.incident_id
      WHERE a.alert_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// Create new alert
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { incident_id, alert_type, message, recipient_role } = req.body;

    const result = await pool.query(
      'INSERT INTO alerts (incident_id, alert_type, message, recipient_role) VALUES ($1, $2, $3, $4) RETURNING *',
      [incident_id, alert_type, message, recipient_role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Update alert
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { incident_id, alert_type, message, recipient_role } = req.body;

    const result = await pool.query(
      'UPDATE alerts SET incident_id = $1, alert_type = $2, message = $3, recipient_role = $4 WHERE alert_id = $5 RETURNING *',
      [incident_id, alert_type, message, recipient_role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Delete alert (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM alerts WHERE alert_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Get alerts by type
router.get('/type/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const result = await pool.query(`
      SELECT a.*, i.type as incident_type, i.severity
      FROM alerts a
      LEFT JOIN incidents i ON a.incident_id = i.incident_id
      WHERE a.alert_type = $1
      ORDER BY a.alert_id DESC
    `, [type]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get alerts by type error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alerts by recipient role
router.get('/role/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const result = await pool.query(`
      SELECT a.*, i.type as incident_type, i.severity
      FROM alerts a
      LEFT JOIN incidents i ON a.incident_id = i.incident_id
      WHERE a.recipient_role = $1
      ORDER BY a.alert_id DESC
    `, [role]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get alerts by role error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get recent alerts (last 10)
router.get('/recent/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, i.type as incident_type, i.severity, i.bus_id
      FROM alerts a
      LEFT JOIN incidents i ON a.incident_id = i.incident_id
      ORDER BY a.alert_id DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get recent alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch recent alerts' });
  }
});

module.exports = router;