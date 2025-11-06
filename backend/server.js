import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { startJobScheduler } from './utils/job_scheduler.js';

// routes
import workersRoutes from './routes/workers.js';
import jobsRoutes from './routes/jobs.js';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import videosRoutes from './routes/videos.js';
import platformsRoutes from './routes/platforms.js';
import analyticsRoutes from './routes/analytics.js';
import regionsRoutes from './routes/regions.js';
import usersRoutes from './routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const app = express();
const PORT = process.env.PORT || 6709;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.send('Control Studio API - Social Media Manager');
});

app.use('/api/workers', workersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api', platformsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/regions', regionsRoutes);
app.use('/api/users', usersRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`Database: PostgreSQL`);
  
  // job scheduler
  startJobScheduler(30000);
});
