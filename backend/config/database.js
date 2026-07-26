const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Create or open SQLite database
const dbPath = path.join(__dirname, '../SkillMirror.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db;
