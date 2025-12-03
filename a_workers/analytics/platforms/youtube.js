import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

function createOAuth2Client(accessToken, refreshToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  return oauth2Client;
}

export async function fetchYouTubeAnalytics(token) {
  console.log('   Calling YouTube Analytics API...');

  const accessToken = token.sub.access_token;
  const refreshToken = token.sub.refresh_token;

  const oauth2Client = createOAuth2Client(accessToken, refreshToken);
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const analyticsData = {
    total: {
      videos: 0,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    },
    videos: []
  };

  const youtubeData = await getChannelVideos(youtube);

  if (youtubeData && youtubeData.videos) {
    analyticsData.total.videos = youtubeData.videos.length;
    analyticsData.videos = youtubeData.videos.map(video => ({
      platform: 'youtube',
      id: video.id,
      title: video.snippet?.title || 'No title',
      views: parseInt(video.statistics?.viewCount || 0),
      likes: parseInt(video.statistics?.likeCount || 0),
      comments: parseInt(video.statistics?.commentCount || 0),
      shares: 0
    }));

    youtubeData.videos.forEach(video => {
      analyticsData.total.views += parseInt(video.statistics?.viewCount || 0);
      analyticsData.total.likes += parseInt(video.statistics?.likeCount || 0);
      analyticsData.total.comments += parseInt(video.statistics?.commentCount || 0);
    });
  }

  try {
    const channelResponse = await youtube.channels.list({
      part: ['statistics'],
      mine: true
    });

    return {
      platform: 'youtube',
      subscribers: parseInt(channelResponse.data.items?.[0]?.statistics?.subscriberCount || 0),
      total: {
        videos: analyticsData.total.videos,
        views: analyticsData.total.views,
        likes: analyticsData.total.likes,
        comments: analyticsData.total.comments,
        shares: analyticsData.total.shares,
        engagement_rate: analyticsData.total.views > 0
          ? ((analyticsData.total.likes + analyticsData.total.comments) / analyticsData.total.views * 100).toFixed(2)
          : '0.00'
      },
      videos: analyticsData.videos
    };
  } catch (err) {
    console.error('Error fetching YouTube channel info:', err.message);
    return {
      platform: 'youtube',
      subscribers: 0,
      total: {
        videos: analyticsData.total.videos,
        views: analyticsData.total.views,
        likes: analyticsData.total.likes,
        comments: analyticsData.total.comments,
        shares: analyticsData.total.shares,
        engagement_rate: analyticsData.total.views > 0
          ? ((analyticsData.total.likes + analyticsData.total.comments) / analyticsData.total.views * 100).toFixed(2)
          : '0.00'
      },
      videos: analyticsData.videos
    };
  }
}

async function getChannelVideos(youtube, limit = 25) {
  try {
    const channelResponse = await youtube.channels.list({
      part: ['contentDetails'],
      mine: true
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      console.error('No channel found for authenticated user');
      return { videos: [] };
    }

    const channelId = channelResponse.data.items[0].id;
    console.log('Authenticated user channel ID:', channelId);

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    const videosResponse = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults: limit
    });

    const videoIds = videosResponse.data.items?.map(item => item.contentDetails.videoId) || [];

    if (videoIds.length === 0) {
      return { videos: [] };
    }

    const statsResponse = await youtube.videos.list({
      part: ['statistics', 'snippet'],
      id: videoIds
    });

    return {
      videos: statsResponse.data.items || []
    };
  } catch (error) {
    console.error('Error getting YouTube videos:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return { videos: [] };
  }
}
