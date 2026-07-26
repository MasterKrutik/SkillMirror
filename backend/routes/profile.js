const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { dbRun, dbGet } = require('../utils/database');

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user profile analysis
router.get('/analysis', verifyToken, async (req, res) => {
  try {
    const profile = await dbGet(db, `SELECT * FROM user_profiles WHERE user_id = ?`, [req.userId]);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save profile analysis results
router.post('/analysis', verifyToken, async (req, res) => {
  try {
    const {
      bio,
      skills,
      experience_level,
      headline,
      profile_analysis_score,
      profile_analysis_feedback,
      profile_completion_percentage
    } = req.body;

    const existingProfile = await dbGet(db, `SELECT id FROM user_profiles WHERE user_id = ?`, [req.userId]);

    if (existingProfile) {
      await dbRun(db, `
        UPDATE user_profiles 
        SET bio = ?, skills = ?, experience_level = ?, headline = ?, 
            profile_analysis_score = ?, profile_analysis_feedback = ?,
            profile_completion_percentage = ?
        WHERE user_id = ?
      `, [
        bio,
        JSON.stringify(skills),
        experience_level,
        headline,
        profile_analysis_score,
        profile_analysis_feedback,
        profile_completion_percentage,
        req.userId
      ]);

      res.json({ message: 'Profile analysis updated successfully' });
    } else {
      const result = await dbRun(db, `
        INSERT INTO user_profiles 
        (user_id, bio, skills, experience_level, headline, profile_analysis_score, 
         profile_analysis_feedback, profile_completion_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.userId,
        bio,
        JSON.stringify(skills),
        experience_level,
        headline,
        profile_analysis_score,
        profile_analysis_feedback,
        profile_completion_percentage
      ]);

      res.status(201).json({
        id: result.lastID,
        message: 'Profile analysis saved successfully'
      });
    }
  } catch (error) {
    console.error('Error saving profile analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get full user profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await dbGet(db, `SELECT id, email, name, profile_picture, created_at FROM users WHERE id = ?`, [req.userId]);
    const profile = await dbGet(db, `SELECT * FROM user_profiles WHERE user_id = ?`, [req.userId]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (profile && profile.skills) {
      try {
        profile.skills = JSON.parse(profile.skills);
      } catch (e) {
        profile.skills = [];
      }
    }

    res.json({
      user,
      profile: profile || null
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user basic info
router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, bio, headline, experience_level } = req.body;

    await dbRun(db, `UPDATE users SET name = ? WHERE id = ?`, [name, req.userId]);
    await dbRun(db, `UPDATE user_profiles SET bio = ?, headline = ?, experience_level = ? WHERE user_id = ?`,
      [bio, headline, experience_level, req.userId]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
