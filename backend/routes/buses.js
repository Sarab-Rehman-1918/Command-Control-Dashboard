const express = require('express');
const pool = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all bus locations (latest position for each bus)
router.get('/locations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (bl.bus_id) 
        bl.bus_id,
        bl.trip_id,
        bl.latitude,
        bl.longitude,
        bl.recorded_at,
        t.status as trip_status,
        t.route_id,
        r.route_name
      FROM bus_locations bl
      LEFT JOIN trips t ON bl.trip_id = t.trip_id
      LEFT JOIN routes r ON t.route_id = r.route_id
      ORDER BY bl.bus_id, bl.recorded_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get bus locations error:', error);
    res.status(500).json({ error: 'Failed to fetch bus locations' });
  }
});

// Get specific bus location history
router.get('/locations/:busId', authenticateToken, async (req, res) => {
  try {
    const { busId } = req.params;
    const result = await pool.query(`
      SELECT bl.*, t.status as trip_status, r.route_name
      FROM bus_locations bl
      LEFT JOIN trips t ON bl.trip_id = t.trip_id
      LEFT JOIN routes r ON t.route_id = r.route_id
      WHERE bl.bus_id = $1
      ORDER BY bl.recorded_at DESC
      LIMIT 100
    `, [busId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get bus location history error:', error);
    res.status(500).json({ error: 'Failed to fetch bus location history' });
  }
});

// Add new bus location (for tracking)
router.post('/locations', authenticateToken, async (req, res) => {
  try {
    const { bus_id, trip_id, latitude, longitude, recorded_at } = req.body;

    const result = await pool.query(
      'INSERT INTO bus_locations (bus_id, trip_id, latitude, longitude, recorded_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [bus_id, trip_id, latitude, longitude, recorded_at || new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add bus location error:', error);
    res.status(500).json({ error: 'Failed to add bus location' });
  }
});

// Get bus location for specific trip
router.get('/locations/trip/:tripId', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await pool.query(`
      SELECT bl.*, r.route_name
      FROM bus_locations bl
      LEFT JOIN trips t ON bl.trip_id = t.trip_id
      LEFT JOIN routes r ON t.route_id = r.route_id
      WHERE bl.trip_id = $1
      ORDER BY bl.recorded_at DESC
    `, [tripId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get trip locations error:', error);
    res.status(500).json({ error: 'Failed to fetch trip locations' });
  }
});

// Get fleet statistics
router.get('/fleet/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT bl.bus_id) as total_buses,
        COUNT(DISTINCT CASE WHEN t.status = 'Ongoing' THEN bl.bus_id END) as active_buses,
        COUNT(DISTINCT CASE WHEN t.status = 'Completed' THEN bl.bus_id END) as completed_buses,
        COUNT(DISTINCT CASE WHEN t.status = 'Delayed' THEN bl.bus_id END) as delayed_buses
      FROM bus_locations bl
      LEFT JOIN trips t ON bl.trip_id = t.trip_id
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get fleet stats error:', error);
    res.status(500).json({ error: 'Failed to fetch fleet statistics' });
  }
});

// Get all unique buses
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT bus_id
      FROM bus_locations
      ORDER BY bus_id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({ error: 'Failed to fetch buses' });
  }
});

module.exports = router;