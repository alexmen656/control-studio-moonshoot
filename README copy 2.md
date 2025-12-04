# 🎬 Reelmia - Social Media Video Management Platform

> A scalable, open-source platform for managing and distributing videos across multiple social media platforms simultaneously. Built with a distributed worker architecture for efficient video processing and analytics collection.

## 📋 Overview

Reelmia is a comprehensive social media management tool designed to streamline video content distribution across multiple platforms. Upload once, publish everywhere - with detailed analytics and scheduling capabilities.

**Key Features:**
- 🎥 Multi-platform video publishing (Instagram, Facebook, YouTube, TikTok)
- 📊 Real-time analytics and performance tracking
- 📅 Advanced scheduling with calendar view
- 👥 Team collaboration with role-based access
- 🔄 Scalable distributed worker system (Docker)
- 🔐 Secure authentication (OAuth, 2FA, WebAuthn)
- 📝 Video comments aggregation
- 🏗️ Multi-project support

## 🌍 Supported Platforms

### ✅ Fully Supported
- **Instagram** - Reels, Stories, Feed Posts
- **Facebook** - Video Posts, Stories
- **YouTube** - Video Uploads with Metadata
- **TikTok** - Short-form Videos (only works with private Channels, because of Tiktok policy)

### 🚧 In Development
- **X (Twitter)** - Video Tweets
- **Reddit** - Video Posts

### 📝 Planned
- **Snapchat** - Snap Stories
- **LinkedIn** - Video Content

## 🏗️ Architecture

Reelmia uses a modern, scalable architecture with three main components:

```
┌─────────────────┐
│   Frontend      │  Vue 3 + TypeScript + Tailwind CSS
│   (Vite)        │
└────────┬────────┘
         │
┌────────▼────────┐
│   API Server    │  Node.js + Express
│   (Port 6709)   │
└────────┬────────┘
         │
    ┌────┴───────────────────┐
    │                        │
┌───▼─────────┐     ┌────────▼───────┐
│ Database    │     │  Worker Pool   │
│(PostgreSQL) │     │  (Docker)      │
└─────────────┘     └────────────────┘
                    │ ├─ Upload Worker
                    │ ├─ Analytics Worker
                    │ └─ Comments Worker
                    └─────────────────
```

### Worker System
The core strength of Reelmia is its **distributed worker system**:
- Each worker runs in its own Docker container
- Automatically assigned jobs based on availability and specialization
- Handles CPU-intensive tasks (video processing, analytics collection)
- Easily scalable - add more containers as needed
- Communicates with backend via secure REST API with certificate authentication

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/1.png)

### Video Management
![Video Management](./screenshots/2.png)

### Analytics & Scheduling
![Analytics](./screenshots/3.png)

### Calendar View
![Calendar](./screenshots/4.png)

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20.19.0 or 22.12.0+
- **PostgreSQL** 12+
- **Docker** (for workers, optional for development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/alexmen656/control-studio-moonshoot
cd control-studio-moonshoot-1
npm install
```

### 2. Frontend Setup

```bash
# Development mode with hot reload
npm run dev -- --port 5185

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend will be available at `http://localhost:5185` (5185 is important because of oauth requests)

### 3. Backend Setup

```bash
cd backend

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Install dependencies
npm install

# Setup database schema
Create all needed tables like in /backend/sql/

# Start main API server
node server.js

# In another terminal, start the worker communication server
node server_for_worker.js
```

**Backend runs on:**
- Main API: `http://localhost:6709`
- Worker Server: `http://localhost:3001` (configurable)

### 4. Worker Setup

Workers process videos, collect analytics, and manage comments. Each worker type can be run in Docker or directly with Node.js.

#### Upload Worker
```bash
cd a_workers/upload

# Configure environment variables
cp .env.example .env

# Development
npm start

# Docker
docker compose up
```

#### Analytics Worker
```bash
cd a_workers/analytics

cp .env.example .env

npm start
# or
docker compose up
```

#### Comments Worker
```bash
cd a_workers/comments

cp .env.example .env

npm start
# or
docker compose up
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:6709
```

**Backend (.env)**
```env
PORT=6709
WORKER_SERVER_PORT=6710
DATABASE_URL=postgresql://user:password@localhost:5432/reelmia
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
# Platform API credentials...
INSTAGRAM_API_KEY=...
TIKTOK_API_KEY=...
YOUTUBE_API_KEY=...
FACEBOOK_API_KEY=...
```

**Workers (.env)**
```env
BACKEND_URL=http://localhost:6709
WORKER_CERT_PATH=./certs/worker.crt
WORKER_KEY_PATH=./keys/worker.key
```

## 📚 Project Structure

```
.
├── src/                          # Frontend (Vue 3 + TypeScript)
│   ├── views/
│   │   ├── HomeView.vue         # Main dashboard
│   │   ├── VideoView.vue        # Video details & publishing
│   │   ├── CalendarView.vue     # Schedule view
│   │   └── ...
│   ├── components/
│   ├── router/
│   └── stores/                  # Pinia state management
│
├── backend/
│   ├── server.js                # Main API server
│   ├── server_for_worker.js     # Worker communication server
│   ├── routes/                  # API routes
│   │   ├── videos.js
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── platforms.js
│   │   └── ...
│   ├── utils/
│   │   ├── db.js                # Database queries
│   │   ├── job_creator.js       # Job queue management
│   │   ├── job_scheduler.js     # Task scheduling
│   │   └── worker_selector.js   # Worker assignment
│   ├── sql/                     # Database schemas
│   └── uploads/                 # Video storage
│
├── a_workers/
│   ├── upload/                  # Video upload processing
│   ├── analytics/               # Analytics collection
│   └── comments/                # Comments aggregation
│
└── docs/                        # Documentation
```

## 🔐 Security

- **OAuth 2.0** integration with Google
- **Two-Factor Authentication (2FA)** with TOTP
- **WebAuthn** support for passwordless authentication
- **JWT** tokens for session management
- **HTTPS/TLS** for worker communication
- **Role-based access control (RBAC)** for team members
- **SSL certificates** for secure inter-component communication

## 📖 API Documentation

### Main Endpoints

**Videos**
- `GET /api/videos` - List videos
- `POST /api/videos/upload` - Upload video
- `GET /api/videos/:id` - Get video details
- `PATCH /api/videos/:id` - Update video metadata
- `DELETE /api/videos/:id` - Delete video

**Analytics**
- `GET /api/analytics/channel/:platform` - Channel analytics
- `GET /api/analytics/video/:videoId` - Video performance
- `GET /api/analytics/insights` - Aggregate insights

**Publishing**
- `POST /api/publish` - Publish video to platforms
- `GET /api/videos/:id/status` - Publishing status

**Worker Management** (Admin)
- `GET /api/workers` - List active workers
- `POST /api/jobs` - Create processing jobs
- `GET /api/jobs/:id/status` - Job status

## 🛠️ Development

### IDE Setup

**VS Code** (Recommended)
1. Install [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
2. Disable Vetur if installed
3. Install [Vue DevTools](https://devtools.vuejs.org/) browser extension

### Browser DevTools

- **Chrome/Edge/Brave**: [Vue DevTools Extension](https://chromewebstore.google.com/detail/vuejs-devtools/)
- **Firefox**: [Vue DevTools Add-on](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### Type Checking

```bash
npm run type-check   # TypeScript validation
```

### Code Formatting

```bash
npm run format       # Format code with Prettier
```

## 📊 Database Schema

Reelmia uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `projects` - Team projects
- `project_users` - Team member access control
- `videos` - Video metadata and status
- `video_platforms` - Platform assignments
- `publish_status` - Per-platform publishing status
- `upload_results` - Upload history and platform IDs
- `video_analytics` - Performance metrics
- `video_comments` - Aggregated comments
- `worker_jobs` - Job queue
- `workers` - Active worker instances

See `backend/sql/` for complete schemas.

## 🐳 Docker Support

### Build Images

```bash
# Upload Worker
cd a_workers/upload
docker build -t reelmia-upload-worker .

# Analytics Worker
cd a_workers/analytics
docker build -t reelmia-analytics-worker .

# Comments Worker
cd a_workers/comments
docker build -t reelmia-comments-worker .
```

### Run with Docker Compose

```bash
# Start all workers
docker compose -f docker-compose.yml up -d

# Scale up workers
docker compose up -d --scale upload-worker=3
```

## 🚧 Known Limitations

- Instagram/Facebook APIs have strict rate limiting
- YouTube requires API quota management
- Some advanced analytics features require additional API access
- Real-time comment streaming not yet implemented
- Cross-platform analytics aggregation in progress

## 📝 Database Migrations

```bash
cd backend

# Run migrations (if migration system is set up)
npm run migrate

# Or manually execute SQL files
psql -U postgres -d reelmia -f sql/schema.sql
psql -U postgres -d reelmia -f sql/upload_results_schema.sql
psql -U postgres -d reelmia -f sql/analytics_schema.sql
# ... etc
```

## 🐛 Troubleshooting

### Workers not connecting
- Check `server_for_worker.js` is running on port 6710
- Verify SSL certificates in worker containers
- Check backend logs for connection errors

### Videos not publishing
- Verify platform API credentials in `.env`
- Check worker logs: `docker logs <worker-container>`
- Ensure video format is supported (MP4, WebM, MOV, etc.)

### Analytics not updating
- Run analytics worker: `cd a_workers/analytics && npm start`
- Check database has `video_analytics` table
- Verify platform API access tokens are valid

## 👨‍💻 Author

Alex Polan

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
1. Check existing GitHub issues
2. Review documentation in `/docs`
3. Create a new issue with detailed information

---

**Note:** This project is under active development. Some features are still being implemented and may change. See the [IDEAS.md](./ideas.md) for planned features.
