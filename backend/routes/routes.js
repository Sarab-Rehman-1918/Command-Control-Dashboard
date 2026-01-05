const express = require('express');
const pool = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all routes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM routes ORDER BY route_id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Get route by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM routes WHERE route_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// Create new route (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { route_name, start_point, end_point, total_distance } = req.body;

    const result = await pool.query(
      'INSERT INTO routes (route_name, start_point, end_point, total_distance) VALUES ($1, $2, $3, $4) RETURNING *',
      [route_name, start_point, end_point, total_distance]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

// Update route (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { route_name, start_point, end_point, total_distance } = req.body;

    const result = await pool.query(
      'UPDATE routes SET route_name = $1, start_point = $2, end_point = $3, total_distance = $4 WHERE route_id = $5 RETURNING *',
      [route_name, start_point, end_point, total_distance, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ error: 'Failed to update route' });
  }
});

// Delete route (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM routes WHERE route_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

// Get route performance
router.get('/:id/performance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        r.route_name,
        COUNT(DISTINCT t.trip_id) as total_trips,
        COUNT(DISTINCT CASE WHEN t.status = 'Completed' THEN t.trip_id END) as completed_trips,
        COUNT(DISTINCT CASE WHEN t.status = 'Delayed' THEN t.trip_id END) as delayed_trips,
        COUNT(DISTINCT i.incident_id) as total_incidents
      FROM routes r
      LEFT JOIN trips t ON r.route_id = t.route_id
      LEFT JOIN incidents i ON t.trip_id = i.trip_id
      WHERE r.route_id = $1
      GROUP BY r.route_id, r.route_name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get route performance error:', error);
    res.status(500).json({ error: 'Failed to fetch route performance' });
  }
});

module.exports = router;