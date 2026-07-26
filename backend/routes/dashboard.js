const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { dbRun, dbGet, dbAll } = require('../utils/database');

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

// ========== COURSES ==========

// Get all courses for user
router.get('/courses', verifyToken, async (req, res) => {
  try {
    const courses = await dbAll(db, 'SELECT * FROM courses WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
    res.json(courses || []);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a course
router.post('/courses', verifyToken, async (req, res) => {
  try {
    const { course_name, course_description, duration_hours, start_date } = req.body;

    if (!course_name) {
      return res.status(400).json({ message: 'Course name is required' });
    }

    const result = await dbRun(db, 
      `INSERT INTO courses (user_id, course_name, course_description, duration_hours, start_date, status)
       VALUES (?, ?, ?, ?, ?, 'in-progress')`,
      [req.userId, course_name, course_description, duration_hours, start_date]
    );

    res.status(201).json({ id: result.lastID, message: 'Course added successfully' });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course progress
router.put('/courses/:courseId', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress_percentage, status } = req.body;

    await dbRun(db,
      `UPDATE courses SET progress_percentage = ?, status = ? WHERE id = ? AND user_id = ?`,
      [progress_percentage, status, courseId, req.userId]
    );

    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== SKILLS ==========

// Get all skills for user
router.get('/skills', verifyToken, async (req, res) => {
  try {
    const skills = await dbAll(db, 'SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
    res.json(skills || []);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a skill
router.post('/skills', verifyToken, async (req, res) => {
  try {
    const { skill_name, proficiency_level } = req.body;

    if (!skill_name) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const result = await dbRun(db,
      `INSERT INTO skills (user_id, skill_name, proficiency_level) VALUES (?, ?, ?)`,
      [req.userId, skill_name, proficiency_level || 'beginner']
    );

    res.status(201).json({ id: result.lastID, message: 'Skill added successfully' });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update skill endorsements
router.put('/skills/:skillId', verifyToken, async (req, res) => {
  try {
    const { skillId } = req.params;
    const { endorsements, proficiency_level } = req.body;

    await dbRun(db,
      `UPDATE skills SET endorsements = ?, proficiency_level = ? WHERE id = ? AND user_id = ?`,
      [endorsements, proficiency_level, skillId, req.userId]
    );

    res.json({ message: 'Skill updated successfully' });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== CONNECTIONS ==========

// Get all connections for user
router.get('/connections', verifyToken, async (req, res) => {
  try {
    const connections = await dbAll(db,
      `SELECT * FROM connections WHERE user_id = ? AND connection_status = 'connected' ORDER BY connected_at DESC`,
      [req.userId]
    );
    res.json(connections || []);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a connection
router.post('/connections', verifyToken, async (req, res) => {
  try {
    const { connection_user_id, connection_name, connection_email } = req.body;

    if (!connection_name || !connection_user_id) {
      return res.status(400).json({ message: 'Connection name and ID are required' });
    }

    const result = await dbRun(db,
      `INSERT INTO connections (user_id, connection_user_id, connection_name, connection_email, connection_status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [req.userId, connection_user_id, connection_name, connection_email]
    );

    res.status(201).json({ id: result.lastID, message: 'Connection request sent' });
  } catch (error) {
    console.error('Error adding connection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept connection
router.put('/connections/:connectionId', verifyToken, async (req, res) => {
  try {
    const { connectionId } = req.params;

    await dbRun(db,
      `UPDATE connections SET connection_status = 'connected' WHERE id = ? AND user_id = ?`,
      [connectionId, req.userId]
    );

    res.json({ message: 'Connection accepted' });
  } catch (error) {
    console.error('Error updating connection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== INTERVIEWS (Dashboard - Scheduled & Taken) ==========

// Get all interviews for user
router.get('/interviews', verifyToken, async (req, res) => {
  try {
    const interviews = await dbAll(db,
      `SELECT * FROM interviews WHERE user_id = ? ORDER BY interview_date DESC`,
      [req.userId]
    );
    res.json(interviews || []);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard summary with all data
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const coursesCount = await dbGet(db,
      `SELECT COUNT(*) as count FROM courses WHERE user_id = ? AND status = 'completed'`,
      [req.userId]
    );

    const skillsCount = await dbGet(db,
      `SELECT COUNT(*) as count FROM skills WHERE user_id = ?`,
      [req.userId]
    );

    const connectionsCount = await dbGet(db,
      `SELECT COUNT(*) as count FROM connections WHERE user_id = ? AND connection_status = 'connected'`,
      [req.userId]
    );

    const interviewsCount = await dbGet(db,
      `SELECT COUNT(*) as count FROM interviews WHERE user_id = ? AND status = 'completed'`,
      [req.userId]
    );

    const upcomingInterviews = await dbAll(db,
      `SELECT * FROM interviews WHERE user_id = ? AND status = 'scheduled' ORDER BY interview_date ASC LIMIT 5`,
      [req.userId]
    );

    res.json({
      completedCourses: coursesCount?.count || 0,
      totalSkills: skillsCount?.count || 0,
      totalConnections: connectionsCount?.count || 0,
      completedInterviews: interviewsCount?.count || 0,
      upcomingInterviews: upcomingInterviews || []
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
