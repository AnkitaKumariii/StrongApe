# StrongApe Backend API

Production-ready modular backend for the gamified fitness social network StrongApe, built using FastAPI, PostgreSQL (SQLAlchemy 2.0 Async), and JWT bearer authentication.

---

## Technical Stack
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Development & Production)
- **ORM**: SQLAlchemy 2.0 (Async)
- **Auth**: JWT (JSON Web Tokens) with HTTP Bearer
- **Testing**: Pytest with `pytest-asyncio` & SQLite async (`aiosqlite`)

---

## Setup & Running Locally

### 1. Database Configuration
Launch the PostgreSQL database using Docker Compose:
```bash
docker-compose up -d
```

### 2. Environment Setup
Configure the environment variables by copying the example template:
```bash
cp backend/.env.example backend/.env
```
Update the settings in `backend/.env` as needed (e.g. database URL or JWT secret key).

### 3. Install Dependencies
Initialize a Python virtual environment and install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### 4. Run Development Server
Start the API server:
```bash
cd backend
uvicorn app.main:app --reload
```
The application will be running locally at `http://127.0.0.1:8000`.
- Swagger UI Documentation: `http://127.0.0.1:8000/docs`
- ReDoc Alternative Docs: `http://127.0.0.1:8000/redoc`

---

## Testing

Run the automated test suite using Pytest. Tests run against an isolated async SQLite database automatically.
```bash
cd backend
pytest -v
```

---

## API Documentation

### 1. Authentication (`/api/auth`)
- **POST `/api/auth/register`**: Registers a new user account.
- **POST `/api/auth/login`**: Authenticates credentials and returns a JWT token.

### 2. User & Profiles (`/api/users`)
- **GET `/api/users/me`**: Returns the current user's profile, including level, XP, and streak.
- **PATCH `/api/users/me/profile`**: Updates name, gym, profile settings, or location coordinates.
- **GET `/api/users/nearby`**: Lists nearby users sorted by location distance.

### 3. Workout Check-in (`/api/checkin`)
- **POST `/api/checkin`**: Logs a workout (tracks duration & intensity). Automatically updates current streak, grants 200 XP, manages level progressions, and generates a feed post.

### 4. Feed & Posts (`/api/posts`)
- **POST `/api/posts`**: Publishes a new social post.
- **GET `/api/posts`**: Lists the global social feed (includes checking liked state).
- **POST `/api/posts/{post_id}/like`**: Likes or unlikes a post.

### 5. Communities (`/api/communities`)
- **POST `/api/communities`**: Creates a new fitness community.
- **GET `/api/communities`**: Lists/searches all communities.
- **GET `/api/communities/joined`**: Lists communities joined by the current user.
- **POST `/api/communities/{community_id}/join`**: Joins a community.
- **GET `/api/communities/{community_id}`**: Retrieves specific community details.

### 6. Challenges (`/api/challenges`)
- **POST `/api/challenges`**: Publishes a new workout challenge.
- **GET `/api/challenges/active`**: Lists the current user's enrolled, incomplete challenges.
- **GET `/api/challenges/browse`**: Lists challenges the user has not joined yet.
- **POST `/api/challenges/{challenge_id}/join`**: Enrolls the user in a challenge.
- **POST `/api/challenges/{challenge_id}/progress`**: Advances a challenge's progress days. Triggers completion rewards and milestone posts when completed.

### 7. Direct Messages Chat (`/api/chats`)
- **GET `/api/chats/threads`**: Lists messaging threads, showing last message and unread counts.
- **POST `/api/chats/threads`**: Starts a direct message thread with another user.
- **GET `/api/chats/threads/{thread_id}/messages`**: Retrieves message history (marks received messages as read).
- **POST `/api/chats/threads/{thread_id}/messages`**: Sends a text message to the thread.
