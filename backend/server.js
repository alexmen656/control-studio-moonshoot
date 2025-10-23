import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'
import { uploadVideo, authorize, getTokenFromCode } from './platforms/YoutubeAPI.js'
import { InstagramAuth, InstagramTokenExchange, uploadReel } from './platforms/InstagramAPI.js'
import { FacebookAuth, FacebookTokenExchange, uploadVideo as uploadFacebookVideo } from './platforms/FacebookAPI.js'
import * as tiktokAPI from './platforms/TiktokAPI.js'
import * as db from './platforms/db.js'
import { storeToken, retrieveToken } from './platforms/token_manager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')
const TOKENS_DIR = path.join(__dirname, 'tokens')

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const app = express()
const PORT = process.env.PORT || 6709

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

if (!fs.existsSync(TOKENS_DIR)) {
  fs.mkdirSync(TOKENS_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|mkv|webm/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Only video files are allowed!'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
})

app.use(cors())
app.use(bodyParser.json())
app.use('/uploads', express.static(uploadsDir))

const getVideoStats = (filePath) => {
  const stats = fs.statSync(filePath)
  const fileSizeInBytes = stats.size
  const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2)
  return {
    size: `${fileSizeInMB} MB`,
    sizeBytes: fileSizeInBytes
  }
}

app.get('/', (req, res) => {
  res.send('Control Studio API - Social Media Manager')
})

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await db.getAllVideos()
    res.json(videos)
  } catch (error) {
    console.error('Error reading videos:', error)
    res.status(500).json({ error: 'Error reading videos' })
  }
})

app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await db.getVideoById(req.params.id)
    if (video) {
      res.json(video)
    } else {
      res.status(404).json({ error: 'Video not found' })
    }
  } catch (error) {
    console.error('Error reading video:', error)
    res.status(500).json({ error: 'Error reading video' })
  }
})

app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' })
    }

    const stats = getVideoStats(req.file.path)

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
      path: req.file.path
    }

    const video = await db.createVideo(newVideo)

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: video
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    res.status(500).json({ error: 'Error uploading video' })
  }
})

app.get('/api/accounts/status', async (req, res) => {
  try {
    res.json({
      youtube: await retrieveToken(1, 'youtube_token') === null ? false : true,
      tiktok: await retrieveToken(1, 'tiktok_token') === null ? false : true,//fs.existsSync(path.join(TOKENS_DIR, 'tiktok_token.json')),
      instagram: await retrieveToken(1, 'instagram_business_account') === null ? false : true,
      facebook: await retrieveToken(1, 'facebook_accounts') === null ? false : true
    })
  } catch (error) {
    console.error('Error checking account status:', error)
    res.status(500).json({ error: 'Error checking account status' })
  }
})

app.post('/api/upload-multiple', upload.array('videos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No video files uploaded' })
    }

    const uploadedVideos = []

    for (let index = 0; index < req.files.length; index++) {
      const file = req.files[index]
      const stats = getVideoStats(file.path)
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
      }

      const video = await db.createVideo(newVideo)
      uploadedVideos.push(video)
    }

    res.status(201).json({
      message: `${uploadedVideos.length} videos uploaded successfully`,
      videos: uploadedVideos
    })
  } catch (error) {
    console.error('Error uploading videos:', error)
    res.status(500).json({ error: 'Error uploading videos' })
  }
})

app.patch('/api/videos/:id/duration', async (req, res) => {
  try {
    const { id } = req.params
    const { duration } = req.body

    if (!duration) {
      return res.status(400).json({ error: 'Duration is required' })
    }

    const video = await db.updateVideo(id, { duration })

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.status(200).json({
      message: 'Duration updated successfully',
      video: video
    })
  } catch (error) {
    console.error('Error updating duration:', error)
    res.status(500).json({ error: 'Error updating duration' })
  }
})

app.put('/api/videos/:id', async (req, res) => {
  try {
    const video = await db.updateVideo(req.params.id, req.body)

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json({
      message: 'Video updated successfully',
      video: video
    })
  } catch (error) {
    console.error('Error updating video:', error)
    res.status(500).json({ error: 'Error updating video' })
  }
})

app.patch('/api/videos/:id', async (req, res) => {
  try {
    const video = await db.updateVideo(req.params.id, req.body)

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json({
      message: 'Video details updated successfully',
      video: video
    })
  } catch (error) {
    console.error('Error updating video:', error)
    res.status(500).json({ error: 'Error updating video' })
  }
})

app.delete('/api/videos/:id', async (req, res) => {
  try {
    const video = await db.getVideoById(req.params.id)

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    if (fs.existsSync(video.path)) {
      fs.unlinkSync(video.path)
    }

    await db.deleteVideo(req.params.id)

    res.json({ message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Error deleting video:', error)
    res.status(500).json({ error: 'Error deleting video' })
  }
})

app.get('/api/used-storage', async (req, res) => {
  try {
    const totalBytes = await db.getTotalStorageUsed()

    res.json({ used_storage: totalBytes, total_storage: 5 * 1024 * 1024 * 1024 })
  } catch (error) {
    console.error('Error calculating used storage:', error)
    res.status(500).json({ error: 'Error calculating used storage' })
  }
})

app.post('/api/videos/bulk-delete', async (req, res) => {
  try {
    const { videoIds } = req.body
    if (!videoIds || !Array.isArray(videoIds)) {
      return res.status(400).json({ error: 'Invalid video IDs' })
    }

    let deletedCount = 0

    for (const id of videoIds) {
      const video = await db.getVideoById(id)
      if (video) {
        if (fs.existsSync(video.path)) {
          fs.unlinkSync(video.path)
        }
        deletedCount++
      }
    }

    await db.bulkDeleteVideos(videoIds)

    res.json({
      message: `${deletedCount} videos deleted successfully`,
      deletedCount
    })
  } catch (error) {
    console.error('Error bulk deleting videos:', error)
    res.status(500).json({ error: 'Error bulk deleting videos' })
  }
})

app.post('/api/connect/:platform', async (req, res) => {
  try {

    const { platform } = req.params

    switch (platform) {
      case 'youtube':
        const result = await authorize();

        if (result.authUrl) {
          return res.json({ authUrl: result.authUrl });
        } else {
          return res.json({ message: 'Connected to YouTube successfully' });
        }

      case 'instagram':
        const instagramAuth = InstagramAuth();
        if (instagramAuth.auth_url) {
          return res.json({ authUrl: instagramAuth.auth_url });
        } else {
          res.json({ message: 'Connected to Instagram successfully' });
        }

      case 'facebook':
        const facebookAuth = FacebookAuth();
        if (facebookAuth.auth_url) {
          return res.json({ authUrl: facebookAuth.auth_url });
        } else {
          res.json({ message: 'Connected to Facebook successfully' });
        }
      case 'tiktok':
        const tiktokResult = await tiktokAPI.authorize();

        if (tiktokResult.authUrl) {
          return res.json({ authUrl: tiktokResult.authUrl });
        } else {
          return res.json({ message: 'Connected to TikTok successfully' });
        }

      default:
        return res.status(400).json({ error: 'Unsupported platform' })
        break;
    }
  } catch (error) {
    console.error('Error connecting to platform:', error)
    res.status(500).json({ error: 'Error connecting to platform' })
  }
})

app.get('/api/oauth2callback/youtube', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    //await fs.promises.writeFile(path.join(TOKENS_DIR, 'youtube_code.json'), JSON.stringify(code));
    await storeToken(1, 'youtube_code', { code: code });
    await getTokenFromCode(code);
    res.redirect('http://localhost:5185/accounts');
    //res.send('YouTube authorization successful! You can close this tab.');
  } catch (error) {
    console.error('Error during YouTube OAuth2 callback:', error);
    res.status(500).send('Error during YouTube authorization');
  }
});

app.get('/api/oauth2callback/tiktok', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('TikTok OAuth error:', error, error_description);
    return res.redirect(`http://localhost:5185/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await tiktokAPI.exchangeCodeForToken(code, state);

    res.redirect('http://localhost:5185/accounts?tiktok=connected');
  } catch (error) {
    console.error('Error during TikTok OAuth2 callback:', error);
    res.redirect('http://localhost:5185/accounts?error=tiktok_auth_failed');
  }
});

app.get('/api/oauth2callback/instagram', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Instagram OAuth error:', error, error_description);
    return res.redirect(`http://localhost:5185/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    // await fs.promises.writeFile(path.join(TOKENS_DIR, 'instagram_code.json'), JSON.stringify(code));
    await storeToken(1, 'instagram_code', { code: code });
    axios.get(InstagramTokenExchange(code)).then(async (response) => {
      // fs.promises.writeFile(path.join(TOKENS_DIR, 'instagram_token.json'), JSON.stringify(response.data));
      await storeToken(1, 'instagram_token', response.data);

      axios.get(`https://graph.facebook.com/v24.0/me/accounts?access_token=${response.data.access_token}`)
        .then(async (response) => {
          // fs.promises.writeFile(path.join(TOKENS_DIR, 'facebook_accounts_for_instagram.json'), JSON.stringify(response.data));
          await storeToken(1, 'facebook_accounts_for_instagram', response.data);

          axios.get(`https://graph.facebook.com/v24.0/${response.data.data[0].id}?fields=instagram_business_account&access_token=${response.data.data[0].access_token}`)
            .then(async (response) => {
              // fs.promises.writeFile(path.join(TOKENS_DIR, 'instagram_business_account.json'), JSON.stringify(response.data));
              await storeToken(1, 'instagram_business_account', response.data);
            });
        });
    });

    res.redirect('http://localhost:5185/accounts?instagram=connected');
  } catch (error) {
    console.error('Error during Instagram OAuth2 callback:', error);
    res.redirect('http://localhost:5185/accounts?error=instagram_auth_failed');
  }
});

app.get('/api/oauth2callback/facebook', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Facebook OAuth error:', error, error_description);
    return res.redirect(`http://localhost:5185/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    //await fs.promises.writeFile(path.join(TOKENS_DIR, 'facebook_code.json'), JSON.stringify(code));
    await storeToken(1, 'facebook_code', { code: code });
    axios.get(FacebookTokenExchange(code)).then(async (response) => {
      // fs.promises.writeFile(path.join(TOKENS_DIR, 'facebook_token.json'), JSON.stringify(response.data));
      await storeToken(1, 'facebook_token', response.data);

      axios.get(`https://graph.facebook.com/v24.0/me/accounts?access_token=${response.data.access_token}`)
        .then(async (response) => {
          // fs.promises.writeFile(path.join(TOKENS_DIR, 'facebook_accounts.json'), JSON.stringify(response.data));
          await storeToken(1, 'facebook_accounts', response.data);
        });
    });

    res.redirect('http://localhost:5185/accounts?facebook=connected');
  } catch (error) {
    console.error('Error during Facebook OAuth2 callback:', error);
    res.redirect('http://localhost:5185/accounts?error=facebook_auth_failed');
  }
});

app.post('/api/publish', async (req, res) => {
  const platformStatuses = {}

  try {
    if (!req.body.videoId) {
      return res.status(400).send('videoId is required')
    }

    const video = await db.getVideoById(req.body.videoId)

    if (!video) {
      return res.status(404).send('Video not found')
    }

    if (!video.platforms || video.platforms.length === 0) {
      return res.status(400).send('No platforms selected for publishing')
    }

    if (video.platforms.includes('youtube')) {
      console.log('Publishing to YouTube:', video.title);
      try {
        await uploadVideo(video)
        platformStatuses.youtube = 'success'
        console.log(`✓ YouTube: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.youtube = 'failed'
        console.error('✗ YouTube: Failed -', error.message)
      }
    }

    if (video.platforms.includes('tiktok')) {
      console.log('Publishing to TikTok:', video.title);
      try {
        await tiktokAPI.uploadVideo(video.path, video.title)
        platformStatuses.tiktok = 'success'
        console.log(`✓ TikTok: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.tiktok = 'failed'
        console.error('✗ TikTok: Failed -', error.message)
      }
    }

    if (video.platforms.includes('instagram')) {
      console.log('Publishing to Instagram:', video.title)
      const videoFile = video.path;
      const options = {
        caption: video.description,
      };

      try {
        await uploadReel({ path: videoFile }, options)
        platformStatuses.instagram = 'success'
        console.log(`✓ Instagram: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.instagram = 'failed'
        console.error('✗ Instagram: Failed -', error.message)
      }
    }

    if (video.platforms.includes('facebook')) {
      console.log('Publishing to Facebook:', video.title)
      const videoFile = video.path;
      const options = {
        title: video.title,
        description: video.description,
      };

      try {
        await uploadFacebookVideo({ path: videoFile }, options)
        platformStatuses.facebook = 'success'
        console.log(`✓ Facebook: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.facebook = 'failed'
        console.error('✗ Facebook: Failed -', error.message)
      }
    }

    const currentDate = new Date().toISOString()

    const publishStatusWithDates = {}
    Object.entries(platformStatuses).forEach(([platform, status]) => {
      if (status === 'success') {
        publishStatusWithDates[platform] = currentDate
      } else {
        publishStatusWithDates[platform] = 'failed'
      }
    })

    const allSuccess = Object.values(platformStatuses).every(status => status === 'success')
    const anySuccess = Object.values(platformStatuses).some(status => status === 'success')

    let newStatus = 'failed'
    if (allSuccess) {
      newStatus = 'published'
    } else if (anySuccess) {
      newStatus = 'partially-published'
    }

    await db.updateVideo(req.body.videoId, {
      publishStatus: publishStatusWithDates,
      status: newStatus,
      publishedAt: anySuccess ? currentDate : null
    })

    const successPlatforms = Object.entries(platformStatuses)
      .filter(([_, status]) => status === 'success')
      .map(([platform, _]) => platform)

    const failedPlatforms = Object.entries(platformStatuses)
      .filter(([_, status]) => status === 'failed')
      .map(([platform, _]) => platform)

    let message = ''
    if (successPlatforms.length > 0) {
      message += `Successfully published to: ${successPlatforms.join(', ')}`
    }
    if (failedPlatforms.length > 0) {
      if (message) message += '. '
      message += `Failed to publish to: ${failedPlatforms.join(', ')}`
    }

    res.status(200).json({
      message: message || 'Publishing completed',
      platformStatuses: platformStatuses
    })
  } catch (error) {
    console.error('Error publishing post:', error)
    res.status(500).json({
      error: 'Error publishing post',
      platformStatuses: platformStatuses
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Uploads directory: ${uploadsDir}`)
  console.log(`Database: PostgreSQL`)
})
