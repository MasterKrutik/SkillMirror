const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { dbRun, dbGet, dbAll } = require('../utils/database');

const router = express.Router();

// Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await dbAll(db, `
      SELECT p.*, u.name, u.profile_picture
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(posts || []);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post with comments
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await dbGet(db, `
      SELECT p.*, u.name, u.profile_picture
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [postId]);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await dbAll(db, `
      SELECT c.*, u.name, u.profile_picture
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);

    res.json({ post, comments: comments || [] });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/posts', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const result = await dbRun(db, `INSERT INTO posts (user_id, content) VALUES (?, ?)`, [req.userId, content]);
    res.status(201).json({ id: result.lastID, message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like post
router.put('/posts/:postId/like', verifyToken, async (req, res) => {
  try {
    await dbRun(db, `UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?`, [req.params.postId]);
    res.json({ message: 'Post liked' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/posts/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await dbGet(db, `SELECT user_id FROM posts WHERE id = ?`, [postId]);

    if (!post || post.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await dbRun(db, `DELETE FROM comments WHERE post_id = ?`, [postId]);
    await dbRun(db, `DELETE FROM posts WHERE id = ?`, [postId]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/posts/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment_text } = req.body;

    if (!comment_text) return res.status(400).json({ message: 'Comment text is required' });

    const post = await dbGet(db, `SELECT id FROM posts WHERE id = ?`, [postId]);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const result = await dbRun(db, 
      `INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)`, 
      [postId, req.userId, comment_text]
    );

    res.status(201).json({ id: result.lastID, message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for post
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const comments = await dbAll(db, `
      SELECT c.*, u.name, u.profile_picture
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.postId]);
    res.json(comments || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like comment
router.put('/comments/:commentId/like', verifyToken, async (req, res) => {
  try {
    await dbRun(db, `UPDATE comments SET likes_count = likes_count + 1 WHERE id = ?`, [req.params.commentId]);
    res.json({ message: 'Comment liked' });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.put('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment_text } = req.body;

    const comment = await dbGet(db, `SELECT user_id FROM comments WHERE id = ?`, [commentId]);
    if (!comment || comment.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await dbRun(db, `UPDATE comments SET comment_text = ? WHERE id = ?`, [comment_text, commentId]);
    res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await dbGet(db, `SELECT user_id FROM comments WHERE id = ?`, [commentId]);

    if (!comment || comment.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await dbRun(db, `DELETE FROM comments WHERE id = ?`, [commentId]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
