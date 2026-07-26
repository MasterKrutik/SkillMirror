const db = require('../config/database');
const { dbRun, dbGet } = require('./database');

async function seedDemoSession(userId) {
  if (!userId) return null;

  try {
    // 1. Ensure is_demo column exists in interview_sessions
    try {
      await dbRun(db, `ALTER TABLE interview_sessions ADD COLUMN is_demo INTEGER DEFAULT 0`);
    } catch (e) {
      // Column likely already exists, ignore
    }

    // 2. Check if user already has any sessions
    const existing = await dbGet(db, `SELECT COUNT(*) as count FROM interview_sessions WHERE user_id = ?`, [userId]);
    if (existing && existing.count > 0) {
      return null; // User already has session data
    }

    // 3. Create ONE completed demo session
    const sessionRes = await dbRun(
      db,
      `INSERT INTO interview_sessions (user_id, role_focus, questions_total, is_demo) VALUES (?, ?, ?, 1)`,
      [userId, 'Software Engineer', 5]
    );

    const sessionId = sessionRes.lastID;

    // 4. Seed 5 answers with realistic telemetry, Elo trajectory, fatigue curve, and topics
    const demoAnswers = [
      {
        question_id: 1,
        question_text: 'Describe how an LRU Cache is implemented in memory using a Doubly Linked List and Hash Map.',
        answer_text: 'An LRU Cache combines a Hash Map for O(1) key-value lookups with a Doubly Linked List to maintain element recency. When a key is accessed or added, it is moved to the head of the list. Eviction removes the tail node in O(1) time.',
        content_score: 76,
        delivery_confidence_score: 74,
        quadrant: 'interview_ready',
        elo_before: 1200,
        elo_after: 1245,
        fatigue_state: 0.08,
        response_time_seconds: 38
      },
      {
        question_id: 2,
        question_text: 'How would you design a rate limiter for a high-throughput public REST API?',
        answer_text: 'I would implement a Token Bucket or Sliding Window Log algorithm backed by a distributed Redis cache. Each API client key holds bucket tokens refilled at a constant rate, returning HTTP 429 Too Many Requests when exhausted.',
        content_score: 85,
        delivery_confidence_score: 82,
        quadrant: 'interview_ready',
        elo_before: 1245,
        elo_after: 1290,
        fatigue_state: 0.20,
        response_time_seconds: 48
      },
      {
        question_id: 3,
        question_text: 'Tell me about a time you resolved a major disagreement on technical architecture with your team.',
        answer_text: 'During our service migration, half the team advocated GraphQL while others preferred REST. I organized a benchmark proof-of-concept testing payload latency and client complexity, leading us to adopt REST with selected GraphQL BFF endpoints by consensus.',
        content_score: 78,
        delivery_confidence_score: 68,
        quadrant: 'hidden_mastery',
        elo_before: 1290,
        elo_after: 1315,
        fatigue_state: 0.36,
        response_time_seconds: 55
      },
      {
        question_id: 4,
        question_text: 'Explain the trade-offs between SQL ACID compliance and NoSQL eventual consistency with real examples.',
        answer_text: 'SQL databases guarantee ACID compliance through multi-version concurrency control, making them ideal for financial transactions where consistency is paramount. NoSQL databases prioritize horizontal scalability and availability with eventual consistency.',
        content_score: 64,
        delivery_confidence_score: 58,
        quadrant: 'articulation_gap',
        elo_before: 1315,
        elo_after: 1302,
        fatigue_state: 0.48,
        response_time_seconds: 60
      },
      {
        question_id: 5,
        question_text: 'Explain how Binary Search and QuickSort operate, analyzing their time and space complexity.',
        answer_text: 'Binary Search operates on sorted arrays by repeatedly halving the search window, running in O(log N) time and O(1) space. QuickSort selects a pivot and partitions elements, achieving O(N log N) average time complexity.',
        content_score: 88,
        delivery_confidence_score: 85,
        quadrant: 'interview_ready',
        elo_before: 1302,
        elo_after: 1340,
        fatigue_state: 0.32,
        response_time_seconds: 42
      }
    ];

    for (const ans of demoAnswers) {
      await dbRun(
        db,
        `INSERT INTO interview_answers 
        (session_id, question_id, question_text, answer_text, content_score, delivery_confidence_score, quadrant, elo_before, elo_after, fatigue_state, response_time_seconds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          ans.question_id,
          ans.question_text,
          ans.answer_text,
          ans.content_score,
          ans.delivery_confidence_score,
          ans.quadrant,
          ans.elo_before,
          ans.elo_after,
          ans.fatigue_state,
          ans.response_time_seconds
        ]
      );
    }

    console.log(`Successfully seeded demo session for user ${userId} (session ID ${sessionId})`);
    return sessionId;
  } catch (error) {
    console.error('Error seeding demo session:', error);
    return null;
  }
}

module.exports = { seedDemoSession };
