# SQLite Backend Setup Guide

## Overview
This is a complete SQLite-based backend for the NUCareer application. All data is stored locally in a `SkillMirror.db` file.

## Database Structure

### Tables Created:
1. **users** - User authentication (email, password)
2. **user_profiles** - User profile analysis and information
3. **courses** - Dashboard courses tracking
4. **skills** - User skills and proficiency levels
5. **connections** - User connections/networking
6. **interviews** - Interview scheduling and results
7. **interview_responses** - Mock AI interview Q&A and answers
8. **posts** - Community posts
9. **comments** - Comments on community posts
10. **resumes** - Resume file uploads

## Features

### 1. Authentication (Login/Signup)
- **Endpoint**: `POST /api/auth/register` - Create new account with email & password
- **Endpoint**: `POST /api/auth/login` - Login with email & password
- **Endpoint**: `POST /api/auth/google-signin` - Google authentication
- Passwords are hashed with bcryptjs
- JWT tokens for session management

### 2. Profile Page (`/profile`)
- **Endpoint**: `GET /api/profile/` - Get full user profile with analysis
- **Endpoint**: `POST /api/profile/analysis` - Save profile analysis results
- **Endpoint**: `PUT /api/profile/` - Update profile information
- Stores profile completion percentage and feedback

### 3. Dashboard (`/dashboard`)
- **Courses**: Track learning progress
  - `GET /api/dashboard/courses` - List all courses
  - `POST /api/dashboard/courses` - Add new course
  - `PUT /api/dashboard/courses/:courseId` - Update progress
  
- **Skills**: Manage professional skills
  - `GET /api/dashboard/skills` - List all skills
  - `POST /api/dashboard/skills` - Add new skill
  - `PUT /api/dashboard/skills/:skillId` - Update skill level

- **Connections**: Networking/connections
  - `GET /api/dashboard/connections` - List connections
  - `POST /api/dashboard/connections` - Add new connection
  - `PUT /api/dashboard/connections/:connectionId` - Accept connection

- **Interviews**: Schedule and track
  - `GET /api/dashboard/interviews` - List all interviews
  - `GET /api/dashboard/summary` - Dashboard overview

### 4. Community (`/community`)
- **Posts**: 
  - `GET /api/community/posts` - List all posts
  - `POST /api/community/posts` - Create new post
  - `PUT /api/community/posts/:postId/like` - Like a post
  - `DELETE /api/community/posts/:postId` - Delete post

- **Comments**: Save and manage comments
  - `POST /api/community/posts/:postId/comments` - Add comment
  - `GET /api/community/posts/:postId/comments` - Get comments
  - `PUT /api/community/comments/:commentId` - Update comment
  - `PUT /api/community/comments/:commentId/like` - Like comment
  - `DELETE /api/community/comments/:commentId` - Delete comment

### 5. Interviews (`/interview`)
- **Scheduling**:
  - `POST /api/interview/schedule` - Schedule interview
  - `PUT /api/interview/:interviewId/status` - Update interview status
  - `PUT /api/interview/:interviewId/reschedule` - Reschedule
  - `GET /api/interview/upcoming` - Upcoming interviews
  - `GET /api/interview/completed` - Completed interviews

- **Mock AI Interview**:
  - `POST /api/interview/:interviewId/responses` - Save Q&A and audio
  - `GET /api/interview/:interviewId/responses` - Get all responses
  - `GET /api/interview/mock/results` - View mock results

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
The `.env` file should be configured with:
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 4. Database
- The SQLite database file `SkillMirror.db` is automatically created in the `backend/` directory
- Database schema is initialized automatically on server startup
- No separate database setup required!

## API Authentication

All protected endpoints require a Bearer token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>'
}
```

## Example Requests

### Register/Signup
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Add a Course
```bash
POST http://localhost:5000/api/dashboard/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_name": "React Advanced",
  "course_description": "Advanced React patterns",
  "duration_hours": 40,
  "start_date": "2024-01-15"
}
```

### Create a Post
```bash
POST http://localhost:5000/api/community/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Just completed my first project in React!"
}
```

### Add Comment to Post
```bash
POST http://localhost:5000/api/community/posts/1/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment_text": "Great job! Well done."
}
```

### Schedule Interview
```bash
POST http://localhost:5000/api/interview/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "interview_title": "Amazon Technical Interview",
  "interview_type": "technical",
  "interview_date": "2024-02-15T10:00:00",
  "duration_minutes": 60,
  "company_name": "Amazon",
  "interviewer_name": "John Smith"
}
```

### Save Mock Interview Response
```bash
POST http://localhost:5000/api/interview/1/responses
Authorization: Bearer <token>
Content-Type: application/json

{
  "question_number": 1,
  "question_text": "Tell me about your experience?",
  "answer_text": "I have 2 years of experience in web development...",
  "audio_file_path": "/uploads/audio/response_1.mp3",
  "answer_score": 8
}
```

## Database File Location
- Path: `backend/SkillMirror.db`
- This is a file-based SQLite database
- No server required!
- Easy to backup, just copy the .db file

## Troubleshooting

### "Module not found: better-sqlite3"
Run: `npm install better-sqlite3`

### Database not initializing
Check that `schema.sql` exists in the `backend/` directory

### Port already in use
Change PORT in `.env` file or run:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Notes
- All passwords are hashed using bcryptjs with 10 salt rounds
- JWT tokens expire after 7 days
- Foreign keys are enabled in SQLite
- All timestamps use ISO 8601 format
- Interview audio files are stored as file paths (you'll need to handle file uploads separately)
