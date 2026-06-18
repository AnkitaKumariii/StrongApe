# Product Requirements Document (PRD): StrongApe

StrongApe is a premium, gamified fitness social network. This document outlines every individual feature, the database tables, schemas, and structural architecture of the app.

---

## 1. Executive Summary & Objective

StrongApe is designed to solve the problem of fitness inconsistency and isolation. By blending social media interaction with RPG-style gamification (experience points, levels, streaks) and utility tools (AI Food Scanner, AI Workout Routine Generator, Nearby Partner Finder), StrongApe incentives users to stay active and build a supportive community.

The core objective is to create a premium, fast, responsive web application where users can:
1. Log workouts to progress through levels and streaks.
2. Find training partners in their immediate geographical vicinity.
3. Chat in real-time with matched partners.
4. Join community tribes grouped by fitness interests.
5. Use Gemini AI for nutrition logging and custom workout plan creation.

---

## 2. Target Audience & Personas

*   **The Lone Lifter**: Needs motivation, wants to track personal workout consistency, and likes gamified metrics (levels, XP, streaks).
*   **The Social Sweat-er**: Wants to find like-minded workout partners nearby to share workouts and keep each other accountable.
*   **The Nutrition Novice**: Wants a quick way to get approximate macro splits and health insights from their daily meals without tedious manual entry.

---

## 3. Core Features & Functional Requirements

### Feature 1: User Onboarding & Authentication
*   **Sign-Up**: Create a new account using `Username`, `Email`, `Password`, and `Full Name`.
*   **Sign-In**: Login using `Username` or `Email` and `Password` to receive a secure JWT access token.
*   **Session Management**: Persistent state via React Context Provider, secure token headers, and automated logout upon expiration.
*   **Fitness Profile Setup**: A prompt/modal on the dashboard for first-time users to capture initial metrics:
    *   Primary goal (Muscle, Weight, Endurance, Health)
    *   Weight (kg) and Height (cm)
    *   Eating style, Caffeine level, Sugar intake
    *   Dietary preferences (Meat-eating, lactose tolerance) and Allergies.

### Feature 2: Gamified Dashboard (Home)
*   **Ape Level & XP Tracker**: Visual circular/linear progress bar showing current level progress. Each workout check-in adds +200 XP. Level caps increase by 1,000 XP increments.
*   **Workout Check-In Logger**:
    *   Allows users to log workouts daily (restricted to once per 24 hours).
    *   Captures `Duration` (minutes), `Intensity` (Low/Medium/High), and optional `Notes`.
    *   Increments the user's consecutive day streak on success.
    *   Logs a corresponding automated post to the community feed.
*   **Community Feed**: Lists posts dynamically with author details (avatar, level, streak), optional media attachments, likes count, and post timestamp.
*   **Active Community Members**: Displays a horizontal interactive avatar list (`AnimatedTooltip`) of online or popular athletes.
*   **Leaderboard Preview**: Short overview panel showing top 3 ranked users.
*   **Nearby Partners Preview**: Quick access sidebar listing matches closest to the user's coordinates.

### Feature 3: Nearby Apes (Partner Matching)
*   **Proximity Sort**: Calculates distances using coordinates (`latitude`, `longitude`) saved in user profiles.
*   **Radius Filter**: Sliding scale (range: 5 km to 100 km) to expand or narrow the partner search scope.
*   **Gym Location Tag**: Displays which gym (e.g. "Gold's Gym Mumbai") the matched partner attends.
*   **Map Preview**: Placeholder grid for a future mapping API integration (currently in Beta).

### Feature 4: Communities (Tribes)
*   **Group Listing**: Category-based tabs (Powerlifting, Running, CrossFit, General Fitness, Yoga).
*   **Join Group**: Instantly join any community, increments the group member count, and links it to the user's dashboard.
*   **Create Group**: Form a new tribe by specifying `Name` (must be unique), `Description` (minimum 10 characters), and `Category`.

### Feature 5: Real-Time Messaging & Chats
*   **Inbox List**: Displays active threads with the last message preview, unread status indicators, and timestamp.
*   **Thread Creation**: Quick conversational starter directly from the "Nearby Apes" list or profile page.
*   **Direct Chat Room**: Fully responsive text exchange with sender distinction, timestamps, and auto-scroll behavior.

### Feature 6: AI Workout Routines
*   **Personalization Engine**: Submits user metrics (goals, physical traits, lifestyle habits) to Gemini AI via FastAPI server.
*   **3-Day Routine Structure**:
    *   Separates warm-ups, main routines, and cool-downs.
    *   Specifies sets, reps, rest intervals, and step-by-step instructions.
    *   Features a dynamic expand/collapse day view and regeneration actions.

### Feature 7: AI Food Scanner
*   **Image Drag-&-Drop / Camera Capture**: Direct file upload endpoint (supporting JPEG, PNG, GIF up to 10MB).
*   **Gemini AI Parsing**: Recognizes food components from the image.
*   **Macros & Nutritional Breakdown**: Estimates total calories (kcal), protein (g), carbs (g), and fats (g).
*   **Insights**: Lists identified items, health benefits, and possible dietary concerns (e.g. high sugar, lactose).

### Feature 8: User Profile & Statistics
*   **Edit Details**: Modify name, home gym label, and location coordinates.
*   **Workouts Log**: Lists chronological history of all registered check-ins.
*   **Achievements / Badges**: Unlocks gamified badge visual cards based on achievements:
    *   *First Step*: Logged first workout.
    *   *Consistent*: 7-day streak achieved.
    *   *Dedicated*: 30-day streak achieved.
    *   *Master Athlete*: Reached Level 5.
*   **Physical & Lifestyle Info**: Displays a read-only list of metrics, dietary settings, allergies, and calculated Body Mass Index (BMI) status.

---

## 4. Database Schema Specification

Below are the detailed descriptions and structures of all database tables configured in the PostgreSQL/SQLite schema.

### Table 1: `users`
Stores all account settings, geolocation, and gamification states.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **id** | Integer | PK | NOT NULL | Auto-incrementing primary key |
| **email** | String | UNIQUE | NOT NULL | User's email address (indexed) |
| **username** | String | UNIQUE | NOT NULL | Unique display name (indexed) |
| **hashed_password** | String | - | NOT NULL | Securely hashed password string |
| **full_name** | String | - | NOT NULL | User's full display name |
| **avatar_url** | String | - | NULLABLE | Remote location of user profile image |
| **level** | Integer | - | NOT NULL | `1` (Current character level) |
| **xp** | Integer | - | NOT NULL | `0` (Total cumulative experience points) |
| **current_streak** | Integer | - | NOT NULL | `0` (Consecutive days of workouts logged) |
| **last_checkin** | Date | - | NULLABLE | Calendar date of user's last check-in |
| **gym_name** | String | - | NULLABLE | Primary workout location |
| **location_lat** | Float | - | NULLABLE | Geographic Latitude coordinate |
| **location_lon** | Float | - | NULLABLE | Geographic Longitude coordinate |
| **settings** | JSON | - | NOT NULL | `{}` (Contains user's layout preferences & fitness profile metrics) |
| **is_active** | Boolean | - | NOT NULL | `True` (User status) |
| **created_at** | DateTime | - | NOT NULL | Current server timestamp |
| **updated_at** | DateTime | - | NOT NULL | Last modification timestamp |

---

### Table 2: `checkins`
Stores the daily workout check-ins logged by users.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **id** | Integer | PK | NOT NULL | Auto-incrementing primary key |
| **user_id** | Integer | FK | NOT NULL | Reference to `users.id` (ondelete="CASCADE") |
| **logged_at** | Date | - | NOT NULL | Current server date |
| **duration_minutes** | Integer | - | NOT NULL | Length of workout session in minutes |
| **intensity** | String | - | NOT NULL | Workout difficulty rating (`Low`, `Medium`, `High`) |
| **notes** | String(140) | - | NULLABLE | Personal reflection notes |
| **created_at** | DateTime | - | NOT NULL | Row creation timestamp |

---

### Table 3: `posts`
Stores the text and media entries published to the community feed.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **id** | Integer | PK | NOT NULL | Auto-incrementing primary key |
| **user_id** | Integer | FK | NOT NULL | Reference to `users.id` (ondelete="CASCADE") |
| **content** | Text | - | NOT NULL | Post body contents |
| **post_type** | String | - | NOT NULL | `regular` (Options: `regular`, `check_in`, `badge_unlocked`) |
| **post_metadata** | JSON | - | NULLABLE | Extra metadata (e.g. details of check-ins or unlocked achievements) |
| **media_url** | String | - | NULLABLE | URL path pointing to attached image files |
| **created_at** | DateTime | - | NOT NULL | Row creation timestamp |
| **updated_at** | DateTime | - | NOT NULL | Last edit timestamp |

---

### Table 4: `post_likes`
Handles mapping of likes between users and posts.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **post_id** | Integer | FK, PK | NOT NULL | Composite Key, Reference to `posts.id` (ondelete="CASCADE") |
| **user_id** | Integer | FK, PK | NOT NULL | Composite Key, Reference to `users.id` (ondelete="CASCADE") |
| **created_at** | DateTime | - | NOT NULL | Row creation timestamp |

---

### Table 5: `communities`
Stores details of the gym tribes/groups.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **id** | Integer | PK | NOT NULL | Auto-incrementing primary key |
| **name** | String | UNIQUE | NOT NULL | Unique group title (indexed) |
| **description** | Text | - | NOT NULL | Brief summary of community |
| **cover_image_url** | String | - | NULLABLE | Remote cover photo path |
| **category** | String | - | NOT NULL | Group tags (e.g. `Powerlifting`, `Running`) |
| **created_at** | DateTime | - | NOT NULL | Row creation timestamp |

---

### Table 6: `community_members`
Maps users who join communities.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **community_id** | Integer | FK, PK | NOT NULL | Composite Key, Reference to `communities.id` (ondelete="CASCADE") |
| **user_id** | Integer | FK, PK | NOT NULL | Composite Key, Reference to `users.id` (ondelete="CASCADE") |
| **role** | String | - | NOT NULL | `member` (Options: `admin`, `member`) |
| **joined_at** | DateTime | - | NOT NULL | Join timestamp |

---

### Table 7: `challenges`
Stores system fitness challenges.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **id** | Integer | PK | NOT NULL | Auto-incrementing primary key |
| **title** | String | UNIQUE | NOT NULL | Unique challenge title (indexed) |
| **description** | Text | - | NOT NULL | Full detail specifications of the challenge goals |
| **total_days** | Integer | - | NOT NULL | `30` (Number of days required to unlock) |
| **xp_reward** | Integer | - | NOT NULL | `100` (XP granted on successful completion) |
| **is_global** | Boolean | - | NOT NULL | `False` (Specifies if visible to all users) |
| **created_at** | DateTime | - | NOT NULL | Row creation timestamp |

---

### Table 8: `user_challenges`
Maps users and their active progress in enrolled challenges.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **user_id** | Integer | FK, PK | NOT NULL | Composite Key, Reference to `users.id` (ondelete="CASCADE") |
| **challenge_id** | Integer | FK, PK | NOT NULL | Composite Key, Reference to `challenges.id` (ondelete="CASCADE") |
| **progress_days** | Integer | - | NOT NULL | `0` (Number of check-in milestones reached) |
| **is_completed** | Boolean | - | NOT NULL | `False` (Completed status marker) |
| **joined_at** | DateTime | - | NOT NULL | Join timestamp |

---

### Table 9: `chat_threads`
Handles thread details.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **id** | Integer | PK | NOT NULL | Auto-incrementing primary key |
| **created_at** | DateTime | - | NOT NULL | Row creation timestamp |

---

### Table 10: `chat_thread_participants`
Maps participants in direct message chat threads.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **thread_id** | Integer | FK, PK | NOT NULL | Composite Key, Reference to `chat_threads.id` (ondelete="CASCADE") |
| **user_id** | Integer | FK, PK | NOT NULL | Composite Key, Reference to `users.id` (ondelete="CASCADE") |
| **joined_at** | DateTime | - | NOT NULL | Join timestamp |

---

### Table 11: `chat_messages`
Stores text chat messages.

| Column Name | Type | Key | Nullability | Default / Description |
| :--- | :--- | :--- | :--- | :--- |
| **id** | Integer | PK | NOT NULL | Auto-incrementing primary key |
| **thread_id** | Integer | FK | NOT NULL | Reference to `chat_threads.id` (ondelete="CASCADE") |
| **sender_id** | Integer | FK | NOT NULL | Reference to `users.id` (ondelete="CASCADE") |
| **content** | Text | - | NOT NULL | Message body text contents |
| **is_read** | Boolean | - | NOT NULL | `False` (Unread indicator state) |
| **created_at** | DateTime | - | NOT NULL | Creation timestamp |

---

## 5. Non-Functional & Quality Attributes

*   **Premium Visuals & Responsiveness**: Clean aesthetics featuring modern dark mode overlays, glowing borders (`GlowingEffect`), high-fidelity icons, micro-animations, and full mobile responsiveness.
*   **Performance & Load Times**: Optimized client-side re-renders through async network caching and local state updates. FastAPI handles concurrent tasks asynchronously using SQLalchemy's async driver.
*   **Security**: Secured password hashing utilizing `bcrypt`. User route authorization verified via HTTP Bearer JWT token exchanges.
*   **API Performance**: Fast response times (under 200ms for standard REST calls) excluding AI endpoints (which rely on third-party Gemini speed).
