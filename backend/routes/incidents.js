const express = require('express');
const pool = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all incidents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, t.status as trip_status, r.route_name
      FROM incidents i
      LEFT JOIN trips t ON i.trip_id = t.trip_id
      LEFT JOIN routes r ON t.route_id = r.route_id
      ORDER BY i.incident_id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Get incident by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT i.*, t.status as trip_status, r.route_name
      FROM incidents i
      LEFT JOIN trips t ON i.trip_id = t.trip_id
      LEFT JOIN routes r ON t.route_id = r.route_id
      WHERE i.incident_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// Create new incident
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { trip_id, bus_id, type, severity, status } = req.body;

    const result = await pool.query(
      'INSERT INTO incidents (trip_id, bus_id, type, severity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [trip_id, bus_id, type, severity, status || 'Open']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Update incident
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { trip_id, bus_id, type, severity, status } = req.body;

    const result = await pool.query(
      'UPDATE incidents SET trip_id = $1, bus_id = $2, type = $3, severity = $4, status = $5 WHERE incident_id = $6 RETURNING *',
      [trip_id, bus_id, type, severity, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Delete incident (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM incidents WHERE incident_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({ error: 'Failed to delete incident' });
  }
});

// Get incidents by status
router.get('/status/:status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.params;
    const result = await pool.query(`
      SELECT i.*, t.status as trip_status, r.route_name
      FROM incidents i
      LEFT JOIN trips t ON i.trip_id = t.trip_id
      LEFT JOIN routes r ON t.route_id = r.route_id
      WHERE i.status = $1
      ORDER BY i.incident_id DESC
    `, [status]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get incidents by status error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Get incidents by severity
router.get('/severity/:severity', authenticateToken, async (req, res) => {
  try {
    const { severity } = req.params;
    const result = await pool.query(`
      SELECT i.*, t.status as trip_status, r.route_name
      FROM incidents i
      LEFT JOIN trips t ON i.trip_id = t.trip_id
      LEFT JOIN routes r ON t.route_id = r.route_id
      WHERE i.severity = $1
      ORDER BY i.incident_id DESC
    `, [severity]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get incidents by severity error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Get incident statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN status = 'Open' THEN 1 END) as open_incidents,
        COUNT(CASE WHEN status = 'Investigating' THEN 1 END) as investigating,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical_incidents,
        COUNT(CASE WHEN severity = 'High' THEN 1 END) as high_severity,
        COUNT(CASE WHEN severity = 'Medium' THEN 1 END) as medium_severity,
        COUNT(CASE WHEN severity = 'Low' THEN 1 END) as low_severity
      FROM incidents
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get incident stats error:', error);
    res.status(500).json({ error: 'Failed to fetch incident statistics' });
  }
});

module.exports = router;