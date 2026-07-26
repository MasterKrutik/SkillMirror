const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/database');
const { seedDemoSession } = require('../utils/seedDemoSession');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Promisify db methods for easier async/await
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Regular Email Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google Sign-In
router.post('/google-signin', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      // Create new user if doesn't exist
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
      
      await dbRun(
        `INSERT INTO users (email, name, password, profile_picture, auth_provider)
         VALUES (?, ?, ?, ?, ?)`,
        [email, name, hashedPassword, picture, 'google']
      );
      
      user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    } else {
      // Update profile picture if using Google
      if (picture && user.auth_provider !== 'google') {
        await dbRun(
          'UPDATE users SET profile_picture = ?, auth_provider = ? WHERE id = ?',
          [picture, 'google', user.id]
        );
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    res.status(500).json({ message: 'Google sign-in failed' });
  }
});

// Register (Signup - Save login credentials)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await dbRun(
      `INSERT INTO users (email, name, password, auth_provider)
       VALUES (?, ?, ?, ?)`,
      [email, name, hashedPassword, 'email']
    );

    // Get the created user
    const newUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

    // Automatically seed ONE demo session for new user
    await seedDemoSession(newUser.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'skillmirror_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


module.exports = router;
