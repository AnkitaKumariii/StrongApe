# StrongApe: Gamified Fitness Social Network

StrongApe is a modern, premium, and fully-featured gamified fitness social network. It is built as a split-tier application with a highly responsive React + TypeScript frontend and a high-performance FastAPI backend. Users can log workouts to gain XP, level up, track streaks, interact with the social feed, search for nearby users, join communities, enroll in challenges, and use an AI-assisted food/nutrition scanner.

---

## 🚀 Key Features

### 🎮 Gamification & Progression
*   **Workout Check-ins**: Log exercises with custom intensity and duration.
*   **XP & Leveling System**: Earn 200 XP per check-in. Levels scale dynamically.
*   **Streak Tracking**: Maintains consecutive days of workouts. Missed days freeze or reset progress.
*   **Interactive Leaderboard**: Real-time rank listing based on XP, level, and active streak.

### 👥 Social Feed & Networking
*   **Global Feed**: Post updates, share achievements, and check user activities.
*   **Liking System**: Real-time toggle of post likes.
*   **Nearby Users**: Search for other "Apes" sorted dynamically by geographic proximity.

### 🏆 Tribes & Challenges
*   **Communities**: Join fitness groups (e.g. "Powerlifters", "Yoga Club") or create your own.
*   **Daily Challenges**: Enroll in active multi-day fitness challenges and log consecutive progress.

### 💬 Messaging
*   **Direct Chat**: Create message threads and chat with other members with read/unread tracking.

### 🥗 Nutrition & Routines
*   **AI Food Scanner**: Leverages Gemini AI to estimate nutritional metrics (calories, protein, fats, carbs) from food descriptions.
*   **Workout Routines**: Browse, create, and schedule structured workout routines.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, TailwindCSS 4, Framer Motion (premium micro-animations), React Router v7, Lucide React Icons |
| **Backend** | FastAPI (Python 3), Uvicorn Development Server, SQLite with `aiosqlite` (for development/production async database driver) |
| **Database & ORM** | SQLAlchemy 2.0 (Async Engine), SQLite DB, Async mappings |
| **Authentication** | JWT (JSON Web Tokens) with HTTP Bearer Auth, bcrypt password hashing |
| **Integrations** | Gemini API (`google-generativeai`) for smart food/nutrition scanning |
| **Testing** | Pytest, `pytest-asyncio` for full asynchronous test suites |

---

## 📂 Project Structure

```text
StrongApe/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── controllers/      # Route controllers (auth, users, posts, chats, etc.)
│   │   ├── models/           # SQLAlchemy Async Database models
│   │   ├── schemas/          # Pydantic schemas (request/response validation)
│   │   ├── services/         # Core business logic (AI client, geolocation, etc.)
│   │   ├── database.py       # Async engine & session setup
│   │   └── main.py           # FastAPI entrypoint
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Backend configuration and keys
│   └── README.md             # Backend-specific documentation
├── src/                      # React Frontend Application
│   ├── assets/               # Static media resources
│   ├── components/
│   │   ├── domain/           # Feature-specific components
│   │   ├── layout/           # Sidebar, navigation, layout wrappers
│   │   └── ui/               # Reusable UI tokens (MagneticDock, GlowingEffect, Card, Dialog, etc.)
│   ├── context/              # Context Providers (AuthContext, etc.)
│   ├── lib/                  # Utility functions (API client, cn helper)
│   ├── pages/                # Application routes / views
│   ├── App.tsx               # Route configurations and protected route wrappers
│   └── main.tsx              # React mounting root
├── index.html                # Vite entry template
├── package.json              # NPM dependencies & scripts
└── tsconfig.json             # TypeScript configuration
```

---

## ⚙️ Installation & Setup

Follow these steps to run both the backend and frontend servers locally.

### 1. Prerequisites
Ensure you have the following installed on your system:
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [Python 3.10+](https://www.python.org/)
*   Git

### 2. Backend Setup
1.  Initialize a Python virtual environment and activate it:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
2.  Install python package dependencies:
    ```bash
    pip install -r backend/requirements.txt
    ```
3.  Configure environment variables. Copy the example file and update values inside `backend/.env`:
    ```bash
    cp backend/.env.example backend/.env
    ```
    Ensure `DATABASE_URL` is set to SQLite async:
    ```env
    DATABASE_URL="sqlite+aiosqlite:///./strongape.db"
    ```
    *Note: Add your `GEMINI_API_KEY` in the environment file if you wish to use the nutrition/food scanner feature.*
4.  Run the development server:
    ```bash
    cd backend
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`. 
    *   **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
    *   **Alternative ReDoc**: `http://127.0.0.1:8000/redoc`

### 3. Frontend Setup
1.  Navigate to the project root directory.
2.  Install NPM dependencies:
    ```bash
    npm install
    ```
3.  Run the Vite development server:
    ```bash
    npm run dev
    ```
    The frontend application will be running at `http://localhost:5173/`.

---

## 🧪 Running Tests

You can execute the automated unit test suite for the FastAPI backend. It utilizes an isolated SQLite in-memory database configuration automatically.

1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Run the tests using Pytest:
    ```bash
    pytest -v
    ```

---

## ✨ Design & Visuals
*   **Theme Toggle**: Supports dynamic Light & Dark mode seamlessly.
*   **Animations**: Built with Framer Motion for premium gestures, transitions, and hover feedback.
*   **Dock Navigation**: Responsive custom-built `MagneticDock` in the sidebar layout for streamlined navigation.
