const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary
router.get('/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    const [fleetStats, tripStats, incidentStats, revenueStats] = await Promise.all([
      // Fleet statistics
      pool.query(`
        SELECT 
          COUNT(DISTINCT bl.bus_id) as total_buses,
          COUNT(DISTINCT CASE WHEN t.status = 'Ongoing' THEN bl.bus_id END) as active_buses
        FROM bus_locations bl
        LEFT JOIN trips t ON bl.trip_id = t.trip_id
      `),
      
      // Trip statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_trips,
          COUNT(CASE WHEN status = 'Ongoing' THEN 1 END) as ongoing_trips,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_trips,
          COUNT(CASE WHEN status = 'Delayed' THEN 1 END) as delayed_trips
        FROM trips
      `),
      
      // Incident statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_incidents,
          COUNT(CASE WHEN status = 'Open' THEN 1 END) as open_incidents,
          COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical_incidents
        FROM incidents
      `),
      
      // Revenue statistics
      pool.query(`
        SELECT 
          COALESCE(SUM(amount), 0) as total_revenue,
          COUNT(*) as total_payments,
          COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as successful_payments
        FROM payments
      `)
    ]);

    res.json({
      fleet: fleetStats.rows[0],
      trips: tripStats.rows[0],
      incidents: incidentStats.rows[0],
      revenue: revenueStats.rows[0]
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Get revenue analytics
router.get('/revenue', authenticateToken, async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    
    let query;
    if (period === 'daily') {
      query = `
        SELECT 
          DATE(transaction_time) as date,
          SUM(amount) as revenue
        FROM fare_transactions
        WHERE type = 'FARE_DEBIT'
        GROUP BY DATE(transaction_time)
        ORDER BY date DESC
        LIMIT 30
      `;
    } else if (period === 'weekly') {
      query = `
        SELECT 
          DATE_TRUNC('week', transaction_time) as week,
          SUM(amount) as revenue
        FROM fare_transactions
        WHERE type = 'FARE_DEBIT'
        GROUP BY week
        ORDER BY week DESC
        LIMIT 12
      `;
    } else {
      query = `
        SELECT 
          DATE_TRUNC('month', transaction_time) as month,
          SUM(amount) as revenue
        FROM fare_transactions
        WHERE type = 'FARE_DEBIT'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `;
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// Get booking statistics
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'Booked' THEN 1 END) as active_bookings,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_bookings,
        SUM(price) as total_booking_value
      FROM tickets
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get booking statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch booking statistics' });
  }
});

// Get route performance
router.get('/routes/performance', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.route_id,
        r.route_name,
        COUNT(DISTINCT t.trip_id) as total_trips,
        COUNT(DISTINCT CASE WHEN t.status = 'Completed' THEN t.trip_id END) as completed_trips,
        COUNT(DISTINCT CASE WHEN t.status = 'Delayed' THEN t.trip_id END) as delayed_trips,
        COUNT(DISTINCT i.incident_id) as total_incidents,
        COALESCE(SUM(tk.price), 0) as revenue
      FROM routes r
      LEFT JOIN trips t ON r.route_id = t.route_id
      LEFT JOIN incidents i ON t.trip_id = i.trip_id
      LEFT JOIN tickets tk ON t.trip_id = tk.trip_id
      GROUP BY r.route_id, r.route_name
      ORDER BY total_trips DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get route performance error:', error);
    res.status(500).json({ error: 'Failed to fetch route performance' });
  }
});

// Get incident trends
router.get('/incidents/trends', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN severity = 'High' THEN 1 END) as high_count
      FROM incidents
      GROUP BY type
      ORDER BY count DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get incident trends error:', error);
    res.status(500).json({ error: 'Failed to fetch incident trends' });
  }
});

// Get bus utilization
router.get('/buses/utilization', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        bl.bus_id,
        COUNT(DISTINCT bl.trip_id) as total_trips,
        COUNT(DISTINCT tk.ticket_id) as tickets_sold,
        COALESCE(SUM(tk.price), 0) as revenue_generated
      FROM bus_locations bl
      LEFT JOIN trips t ON bl.trip_id = t.trip_id
      LEFT JOIN tickets tk ON t.trip_id = tk.trip_id
      GROUP BY bl.bus_id
      ORDER BY bl.bus_id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get bus utilization error:', error);
    res.status(500).json({ error: 'Failed to fetch bus utilization' });
  }
});

// Get payment method distribution
router.get('/payments/distribution', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as successful_payments
      FROM payments
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get payment distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch payment distribution' });
  }
});

module.exports = router;