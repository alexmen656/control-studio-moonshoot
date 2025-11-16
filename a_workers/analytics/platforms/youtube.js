import axios from 'axios';

export async function fetchYouTubeAnalytics(token) {
  console.log('   Calling YouTube Analytics API...');

  const youtubeToken = {
    accessToken: token.sub.access_token || token.sub.accessToken
  };
  
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

  const youtubeData = await getChannelVideos(youtubeToken);

  if (youtubeData && youtubeData.data && youtubeData.data.videos) {
    analyticsData.total.videos = youtubeData.data.videos.length;
    analyticsData.videos = youtubeData.data.videos.map(video => ({
      platform: 'youtube',
      id: video.id,
      title: video.snippet?.title || 'No title',
      views: parseInt(video.statistics?.viewCount || 0),
      likes: parseInt(video.statistics?.likeCount || 0),
      comments: parseInt(video.statistics?.commentCount || 0),
      shares: 0
    }));

    youtubeData.data.videos.forEach(video => {
      analyticsData.total.views += parseInt(video.statistics?.viewCount || 0);
      analyticsData.total.likes += parseInt(video.statistics?.likeCount || 0);
      analyticsData.total.comments += parseInt(video.statistics?.commentCount || 0);
    });
  }

  //console.log('YouTube analytics data compiled:', analyticsData);

  try {
    const { accessToken } = youtubeToken;
    const channelResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          part: 'statistics',
          mine: true,
          access_token: accessToken
        }
      }
    );

    const subscribers = channelResponse.data.items?.[0]?.statistics?.subscriberCount || 0;

    return {
      platform: 'youtube',
      subscribers: parseInt(subscribers),
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

async function getChannelVideos(token, limit = 25) {
  try {
    const { accessToken } = token;

    const channelResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          part: 'contentDetails',
          mine: true,
          access_token: accessToken
        },
        validateStatus: function (status) {
          return status < 500;
        }
      }
    );

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channelId = channelResponse.data.items[0].id;
    console.log('Authenticated user channel ID:', channelId);

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    const videosResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/playlistItems',
      {
        params: {
          part: 'snippet,contentDetails',
          playlistId: uploadsPlaylistId,
          maxResults: limit,
          access_token: accessToken
        },
        validateStatus: function (status) {
          return status < 500;
        }
      }
    );

    if (videosResponse.data.error) {
      console.warn('YouTube API returned an error:', videosResponse.data.error);
    }

    const videoIds = videosResponse.data.items?.map(item => item.contentDetails.videoId).join(',') || '';

    if (!videoIds) {
      return {
        data: { videos: [] },
        status: 200
      };
    }

    const statsResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'statistics,snippet',
          id: videoIds,
          access_token: accessToken
        },
        validateStatus: function (status) {
          return status < 500;
        }
      }
    );

    return {
      data: {
        videos: statsResponse.data.items || []
      },
      status: statsResponse.status
    };
  } catch (error) {
    console.error('Error getting YouTube videos:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return {
      data: { videos: [] },
      status: error.response?.status || 500
    };
  }
}
