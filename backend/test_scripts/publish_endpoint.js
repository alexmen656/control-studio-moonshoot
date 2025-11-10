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
        await youTubeManager.uploadVideo(video)
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
        await tiktokManager.uploadVideo(video.path, video.title)
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
      }

      try {
        await instagramManager.uploadReel({ path: videoFile }, options)
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
        await facebookManager.uploadVideo({ path: videoFile }, options)
        platformStatuses.facebook = 'success'
        console.log(`✓ Facebook: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.facebook = 'failed'
        console.error('✗ Facebook: Failed -', error.message)
      }
    }

    if (video.platforms.includes('x')) {
      console.log('Publishing to X (Twitter):', video.title)
      const videoFile = video.path;
      const options = {
        text: video.description || video.title,
      };

      try {
        await xManager.uploadVideo({ path: videoFile }, options)
        platformStatuses.x = 'success'
        console.log(`✓ X: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.x = 'failed'
        console.error('✗ X: Failed -', error.message)
      }
    }

    if (video.platforms.includes('reddit')) {
      console.log('Publishing to Reddit:', video.title)
      const videoFile = video.path;
      const options = {
        title: video.title,
        subreddit: video.subreddit || 'videos', // Default subreddit, should be configurable
      };

      try {
        await redditManager.uploadVideo({ path: videoFile, originalname: video.title }, options)
        platformStatuses.reddit = 'success'
        console.log(`✓ Reddit: Published successfully at ${new Date().toLocaleString()}`)
      } catch (error) {
        platformStatuses.reddit = 'failed'
        console.error('✗ Reddit: Failed -', error.message)
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
