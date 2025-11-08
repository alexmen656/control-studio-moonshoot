import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware, projectAccessMiddleware } from '../utils/auth.js';
import * as db from '../utils/db.js'
import { createUploadJobs } from '../utils/job_creator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

const router = express.Router();

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});

const getVideoStats = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
  return {
    size: `${fileSizeInMB} MB`,
    sizeBytes: fileSizeInBytes
  };
};

// ============================================
// VIDEO ROUTES
// ============================================

router.get('/', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const videos = await db.getVideosByProjectId(req.project.id);
    res.json(videos);
  } catch (error) {
    console.error('Error reading videos:', error);
    res.status(500).json({ error: 'Error reading videos' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const video = await db.getVideoById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [video.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    res.json(video);
  } catch (error) {
    console.error('Error reading video:', error);
    res.status(500).json({ error: 'Error reading video' });
  }
});

router.post('/upload', authMiddleware, projectAccessMiddleware, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log('Upload - req.project:', req.project);
    console.log('Upload - req.query.project_id:', req.query.project_id);
    console.log('Upload - req.body.project_id:', req.body.project_id);

    const stats = getVideoStats(req.file.path);

    const newVideo = {
      id: Date.now().toString(),
      title: req.body.title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      filename: req.file.filename,
      originalName: req.file.originalname,
      thumbnail: req.body.thumbnail || 'https://via.placeholder.com/400x225',
      duration: '0:00',
      size: stats.size,
      sizeBytes: stats.sizeBytes,
      uploadDate: new Date().toISOString(),
      status: 'awaiting-details',
      progress: 100,
      platforms: req.body.platforms ? JSON.parse(req.body.platforms) : [],
      views: 0,
      path: req.file.path,
      project_id: req.project.id
    };

    const video = await db.createVideo(newVideo);

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: video
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Error uploading video' });
  }
});

router.post('/upload-multiple', upload.array('videos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No video files uploaded' });
    }

    const uploadedVideos = [];

    for (let index = 0; index < req.files.length; index++) {
      const file = req.files[index];
      const stats = getVideoStats(file.path);
      const newVideo = {
        id: (Date.now() + index).toString(),
        title: file.originalname.replace(/\.[^/.]+$/, ''),
        filename: file.filename,
        originalName: file.originalname,
        thumbnail: 'https://via.placeholder.com/400x225',
        duration: '0:00',
        size: stats.size,
        sizeBytes: stats.sizeBytes,
        uploadDate: new Date().toISOString(),
        status: 'awaiting-details',
        progress: 100,
        platforms: [],
        views: 0,
        path: file.path
      };

      const video = await db.createVideo(newVideo);
      uploadedVideos.push(video);
    }

    res.status(201).json({
      message: `${uploadedVideos.length} videos uploaded successfully`,
      videos: uploadedVideos
    });
  } catch (error) {
    console.error('Error uploading videos:', error);
    res.status(500).json({ error: 'Error uploading videos' });
  }
});

router.patch('/:id/duration', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;

    if (!duration) {
      return res.status(400).json({ error: 'Duration is required' });
    }

    const video = await db.getVideoById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [video.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    const updatedVideo = await db.updateVideo(id, { duration });

    res.status(200).json({
      message: 'Duration updated successfully',
      video: updatedVideo
    });
  } catch (error) {
    console.error('Error updating duration:', error);
    res.status(500).json({ error: 'Error updating duration' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const videoCheck = await db.getVideoById(req.params.id);
    if (!videoCheck) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (videoCheck.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [videoCheck.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    const video = await db.updateVideo(req.params.id, req.body);

    res.json({
      message: 'Video updated successfully',
      video: video
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Error updating video' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const videoCheck = await db.getVideoById(req.params.id);
    if (!videoCheck) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (videoCheck.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [videoCheck.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    const video = await db.updateVideo(req.params.id, req.body);

    res.json({
      message: 'Video details updated successfully',
      video: video
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Error updating video' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const video = await db.getVideoById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.project_id) {
      const accessResult = await db.query(
        'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
        [video.project_id, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this video' });
      }
    }

    if (fs.existsSync(video.path)) {
      fs.unlinkSync(video.path);
    }

    await db.deleteVideo(req.params.id);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Error deleting video' });
  }
});

router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { videoIds } = req.body;
    if (!videoIds || !Array.isArray(videoIds)) {
      return res.status(400).json({ error: 'Invalid video IDs' });
    }

    let deletedCount = 0;
    const unauthorizedVideos = [];

    for (const id of videoIds) {
      const video = await db.getVideoById(id);
      if (video) {
        if (video.project_id) {
          const accessResult = await db.query(
            'SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2',
            [video.project_id, req.user.id]
          );

          if (accessResult.rows.length === 0) {
            unauthorizedVideos.push(id);
            continue;
          }
        }

        if (fs.existsSync(video.path)) {
          fs.unlinkSync(video.path);
        }
        deletedCount++;
      }
    }

    const authorizedVideoIds = videoIds.filter(id => !unauthorizedVideos.includes(id));
    if (authorizedVideoIds.length > 0) {
      await db.bulkDeleteVideos(authorizedVideoIds);
    }

    res.json({
      message: `${deletedCount} videos deleted successfully`,
      deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting videos:', error);
    res.status(500).json({ error: 'Error bulk deleting videos' });
  }
});

router.get('/storage/used', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    const totalBytes = await db.getTotalStorageUsed();

    res.json({ used_storage: totalBytes, total_storage: 5 * 1024 * 1024 * 1024 });
  } catch (error) {
    console.error('Error calculating used storage:', error);
    res.status(500).json({ error: 'Error calculating used storage' });
  }
});

router.post('/publish', authMiddleware, projectAccessMiddleware, async (req, res) => {
  try {
    if (!req.body.videoId) {
      return res.status(400).send('videoId is required');
    }

    const video = await db.getVideoById(req.body.videoId);

    if (!video) {
      return res.status(404).send('Video not found');
    }

    if (!video.platforms || video.platforms.length === 0) {
      return res.status(400).send('No platforms selected for publishing');
    }

    console.log(video);
    console.log('Creating publish jobs for video ID:', video.id, 'on platforms:', video.platforms);
    const jobs = await createUploadJobs(video.id, video.platforms, req.project.id, video.priority || 0);

    return res.json({ message: 'Publish jobs created', jobs });
  } catch (error) {
    console.error('Error publishing video:', error);
    return res.status(500).send('Error publishing video');
  }
});

export default router;
