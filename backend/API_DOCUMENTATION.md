# SQLite Backend - Complete API Documentation

## ✅ Server Status
**Server**: http://localhost:5000  
**Database**: SQLite (File-based at `backend/SkillMirror.db`)  
**Status**: ✅ Running and Ready

---

## 🔐 Authentication

All protected endpoints require a **Bearer Token** in the `Authorization` header:

```javascript
Headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

Tokens expire after **7 days**.

---

## 📋 API Endpoints

### 1️⃣ **AUTHENTICATION** (`/api/auth`)

#### Register (Signup)
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Auth**: ❌ Not required
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }
  ```
- **Response**: 
  ```json
  { "message": "User registered successfully" }
  ```

#### Login
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Auth**: ❌ Not required
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

#### Google Sign-In
- **Method**: `POST`
- **URL**: `/api/auth/google-signin`
- **Auth**: ❌ Not required
- **Body**:
  ```json
  {
    "token": "google_id_token_here"
  }
  ```

---

### 2️⃣ **USER PROFILE** (`/api/users`)

#### Get Profile
- **Method**: `GET`
- **URL**: `/api/users/profile`
- **Auth**: ✅ Required
- **Response**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "profile_picture": "url_here"
  }
  ```

#### Update Profile
- **Method**: `PUT`
- **URL**: `/api/users/profile`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "name": "John Updated",
    "email": "newemail@example.com"
  }
  ```

---

### 3️⃣ **PROFILE PAGE** (`/api/profile`)

#### Get Full Profile with Analysis
- **Method**: `GET`
- **URL**: `/api/profile/`
- **Auth**: ✅ Required
- **Response**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "profile_picture": "url",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "profile": {
      "id": 1,
      "user_id": 1,
      "bio": "Software Engineer",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience_level": "intermediate",
      "headline": "Full Stack Developer",
      "profile_analysis_score": 85,
      "profile_analysis_feedback": "Your profile is well optimized...",
      "profile_completion_percentage": 90
    }
  }
  ```

#### Get Profile Analysis
- **Method**: `GET`
- **URL**: `/api/profile/analysis`
- **Auth**: ✅ Required

#### Save Profile Analysis
- **Method**: `POST`
- **URL**: `/api/profile/analysis`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "bio": "Passionate Full Stack Developer",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "experience_level": "intermediate",
    "headline": "Full Stack Developer | Problem Solver",
    "profile_analysis_score": 85,
    "profile_analysis_feedback": "Your profile looks great!",
    "profile_completion_percentage": 90
  }
  ```

#### Update Profile
- **Method**: `PUT`
- **URL**: `/api/profile/`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "name": "John Doe",
    "bio": "Updated bio",
    "headline": "Senior Developer",
    "experience_level": "advanced"
  }
  ```

---

### 4️⃣ **DASHBOARD** (`/api/dashboard`)

#### Get Courses
- **Method**: `GET`
- **URL**: `/api/dashboard/courses`
- **Auth**: ✅ Required
- **Response**:
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "course_name": "React Advanced",
      "course_description": "Advanced patterns in React",
      "progress_percentage": 45,
      "duration_hours": 40,
      "status": "in-progress",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```

#### Add Course
- **Method**: `POST`
- **URL**: `/api/dashboard/courses`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "course_name": "React Advanced",
    "course_description": "Advanced patterns in React",
    "duration_hours": 40,
    "start_date": "2024-01-15"
  }
  ```

#### Update Course Progress
- **Method**: `PUT`
- **URL**: `/api/dashboard/courses/:courseId`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "progress_percentage": 75,
    "status": "completed"
  }
  ```

#### Get Skills
- **Method**: `GET`
- **URL**: `/api/dashboard/skills`
- **Auth**: ✅ Required

#### Add Skill
- **Method**: `POST`
- **URL**: `/api/dashboard/skills`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "skill_name": "JavaScript",
    "proficiency_level": "advanced"
  }
  ```

#### Update Skill
- **Method**: `PUT`
- **URL**: `/api/dashboard/skills/:skillId`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "endorsements": 15,
    "proficiency_level": "expert"
  }
  ```

#### Get Connections
- **Method**: `GET`
- **URL**: `/api/dashboard/connections`
- **Auth**: ✅ Required

#### Add Connection
- **Method**: `POST`
- **URL**: `/api/dashboard/connections`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "connection_user_id": 2,
    "connection_name": "Jane Smith",
    "connection_email": "jane@example.com"
  }
  ```

#### Accept Connection
- **Method**: `PUT`
- **URL**: `/api/dashboard/connections/:connectionId`
- **Auth**: ✅ Required

#### Get Dashboard Summary
- **Method**: `GET`
- **URL**: `/api/dashboard/summary`
- **Auth**: ✅ Required
- **Response**:
  ```json
  {
    "completedCourses": 2,
    "totalSkills": 5,
    "totalConnections": 12,
    "completedInterviews": 1,
    "upcomingInterviews": [
      {
        "id": 1,
        "interview_title": "Amazon Technical",
        "interview_type": "technical",
        "interview_date": "2024-02-15T10:00:00Z",
        "status": "scheduled"
      }
    ]
  }
  ```

#### Get Interviews
- **Method**: `GET`
- **URL**: `/api/dashboard/interviews`
- **Auth**: ✅ Required

---

### 5️⃣ **COMMUNITY** (`/api/community`)

#### Get All Posts
- **Method**: `GET`
- **URL**: `/api/community/posts`
- **Auth**: ❌ Not required
- **Response**:
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "content": "Just completed my React project!",
      "likes_count": 5,
      "name": "John Doe",
      "profile_picture": "url",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
  ```

#### Get Single Post with Comments
- **Method**: `GET`
- **URL**: `/api/community/posts/:postId`
- **Auth**: ❌ Not required
- **Response**:
  ```json
  {
    "post": { ... },
    "comments": [ ... ]
  }
  ```

#### Create Post
- **Method**: `POST`
- **URL**: `/api/community/posts`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "content": "Just completed my React project!"
  }
  ```

#### Like Post
- **Method**: `PUT`
- **URL**: `/api/community/posts/:postId/like`
- **Auth**: ✅ Required

#### Delete Post
- **Method**: `DELETE`
- **URL**: `/api/community/posts/:postId`
- **Auth**: ✅ Required

#### Get Comments for Post
- **Method**: `GET`
- **URL**: `/api/community/posts/:postId/comments`
- **Auth**: ❌ Not required

#### Add Comment
- **Method**: `POST`
- **URL**: `/api/community/posts/:postId/comments`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "comment_text": "Great work!"
  }
  ```

#### Like Comment
- **Method**: `PUT`
- **URL**: `/api/community/comments/:commentId/like`
- **Auth**: ✅ Required

#### Update Comment
- **Method**: `PUT`
- **URL**: `/api/community/comments/:commentId`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "comment_text": "Updated comment text"
  }
  ```

#### Delete Comment
- **Method**: `DELETE`
- **URL**: `/api/community/comments/:commentId`
- **Auth**: ✅ Required

---

### 6️⃣ **INTERVIEWS** (`/api/interview`)

#### Get All Interviews
- **Method**: `GET`
- **URL**: `/api/interview/`
- **Auth**: ✅ Required

#### Get Upcoming Interviews
- **Method**: `GET`
- **URL**: `/api/interview/upcoming`
- **Auth**: ✅ Required

#### Get Completed Interviews
- **Method**: `GET`
- **URL**: `/api/interview/completed`
- **Auth**: ✅ Required

#### Schedule Interview
- **Method**: `POST`
- **URL**: `/api/interview/schedule`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "interview_title": "Amazon Technical Round",
    "interview_type": "technical",
    "interview_date": "2024-02-15T10:00:00Z",
    "duration_minutes": 60,
    "company_name": "Amazon",
    "interviewer_name": "John Smith"
  }
  ```

#### Update Interview Status
- **Method**: `PUT`
- **URL**: `/api/interview/:interviewId/status`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "status": "completed",
    "score": 85,
    "feedback": "Great performance overall"
  }
  ```

#### Reschedule Interview
- **Method**: `PUT`
- **URL**: `/api/interview/:interviewId/reschedule`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "interview_date": "2024-02-16T10:00:00Z"
  }
  ```

#### Cancel Interview
- **Method**: `DELETE`
- **URL**: `/api/interview/:interviewId`
- **Auth**: ✅ Required

#### Get Interview Responses
- **Method**: `GET`
- **URL**: `/api/interview/:interviewId/responses`
- **Auth**: ✅ Required

#### Save Interview Response
- **Method**: `POST`
- **URL**: `/api/interview/:interviewId/responses`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "question_number": 1,
    "question_text": "Tell me about yourself?",
    "answer_text": "I'm a full stack developer with 2 years of experience...",
    "audio_file_path": "/uploads/audio/response_1.mp3",
    "ai_feedback": "Good answer, could add more specific examples",
    "answer_score": 8
  }
  ```

#### Update Interview Response
- **Method**: `PUT`
- **URL**: `/api/interview/responses/:responseId`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "answer_text": "Updated answer",
    "audio_file_path": "/uploads/audio/new_response.mp3",
    "ai_feedback": "Improved answer",
    "answer_score": 9
  }
  ```

#### Get Mock Interview Results
- **Method**: `GET`
- **URL**: `/api/interview/mock/results`
- **Auth**: ✅ Required

#### Create Mock Interview Session
- **Method**: `POST`
- **URL**: `/api/interview/mock/create`
- **Auth**: ✅ Required
- **Body**:
  ```json
  {
    "interview_title": "Mock Interview - JavaScript",
    "interview_date": "2024-01-20T14:00:00Z",
    "duration_minutes": 30
  }
  ```

---

### 🏥 **HEALTH CHECK** (`/api/health`)

- **Method**: `GET`
- **URL**: `/api/health`
- **Auth**: ❌ Not required
- **Response**:
  ```json
  {
    "status": "Server is running",
    "database": "SQLite"
  }
  ```

---

## 📦 Database Schema

### Tables
1. **users** - User authentication
2. **user_profiles** - Profile analysis results
3. **courses** - Dashboard courses
4. **skills** - User skills
5. **connections** - Networking connections
6. **interviews** - Interview scheduling & management
7. **interview_responses** - Mock AI interview Q&A
8. **posts** - Community posts
9. **comments** - Post comments
10. **resumes** - Resume uploads

---

## 🚀 Quick Start

### 1. Start the server (if not running)
```bash
cd backend
npm start
```

### 2. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Use the token for protected endpoints
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔄 Data Flow Examples

### Example 1: Complete Signup & Profile Setup
1. **Register** → POST `/api/auth/register`
2. **Login** → POST `/api/auth/login` (get token)
3. **Save Profile Analysis** → POST `/api/profile/analysis`
4. **Add Skills** → POST `/api/dashboard/skills` (multiple)
5. **Add Course** → POST `/api/dashboard/courses`

### Example 2: Community Interaction
1. **Create Post** → POST `/api/community/posts`
2. **Add Comment** → POST `/api/community/posts/:postId/comments`
3. **Like Post** → PUT `/api/community/posts/:postId/like`

### Example 3: Interview Process
1. **Schedule Interview** → POST `/api/interview/schedule`
2. **Create Mock Session** → POST `/api/interview/mock/create`
3. **Save Response** → POST `/api/interview/:interviewId/responses`
4. **Update Status** → PUT `/api/interview/:interviewId/status`

---

## 💾 Database File
- **Location**: `backend/SkillMirror.db`
- **Type**: SQLite
- **Size**: Grows as users add data
- **Backup**: Simply copy the .db file

---

## ⚙️ Environment Variables (.env)
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NODE_ENV=development
```

---

## 🐛 Troubleshooting

### Database not found error
- Ensure `schema.sql` exists in `backend/` folder
- Server automatically creates `SkillMirror.db` on first run

### Port 5000 already in use
```bash
# Stop all Node processes
taskkill /F /IM node.exe

# Or specify a different port
PORT=3001 npm start
```

### Authorization errors
- Always include Bearer token in Authorization header
- Token format: `Bearer eyJhbGc...`
- Token expires after 7 days

---

## ✨ Features Summary
- ✅ Email/Password Authentication
- ✅ Google Sign-In
- ✅ Profile Analysis Saving
- ✅ Dashboard (Courses, Skills, Connections)
- ✅ Interview Scheduling
- ✅ Mock AI Interview with Q&A
- ✅ Community Posts & Comments
- ✅ JWT Token Authentication
- ✅ SQLite Database (File-based)
- ✅ No server required (all data local)
