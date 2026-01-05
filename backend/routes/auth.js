const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // For demo purposes, check default admin
    if (email === 'admin@ptc.gov.pk' && password === 'admin123') {
      const token = jwt.sign(
        { user_id: 1, email, role: 'Admin', name: 'System Admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          user_id: 1,
          name: 'System Admin',
          email,
          role: 'Admin'
        }
      });
    }

    // Check in database
    const result = await pool.query(
      'SELECT * FROM users WHERE contact = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // For simplicity, we're not hashing passwords in this demo
    // In production, use bcrypt.compare()
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.contact, 
        role: user.role,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.contact,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(403).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;