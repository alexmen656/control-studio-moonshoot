import axios from 'axios';

export async function fetchYouTubeAnalytics(token, metadata) {
  console.log('   Calling YouTube Analytics API...');
  console.log(metadata);

  const youtubeToken = {
    accessToken: token.sub.access_token,
    channelId: token.sub.channelId
  };

  const analyticsData = {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalVideos: 0,
    videos: []
  };

  const youtubeData = await getChannelVideos(youtubeToken);

  if (youtubeData && youtubeData.data && youtubeData.data.videos) {
    analyticsData.totalVideos = youtubeData.data.videos.length;
    analyticsData.videos = youtubeData.data.videos.map(video => ({
      platform: 'youtube',
      id: video.id,
      title: video.title || 'No title',
      views: video.statistics?.viewCount || 0,
      likes: video.statistics?.likeCount || 0,
      comments: video.statistics?.commentCount || 0,
      shares: 0
    }));

    youtubeData.data.videos.forEach(video => {
      analyticsData.totalViews += parseInt(video.statistics?.viewCount || 0);
      analyticsData.totalLikes += parseInt(video.statistics?.likeCount || 0);
      analyticsData.totalComments += parseInt(video.statistics?.commentCount || 0);
    });
  }

  console.log('YouTube analytics data compiled:', analyticsData);

  return {
    platform: 'youtube',
    subscribers: Math.floor(Math.random() * 100000),
    total_videos: analyticsData.totalVideos,
    total_views: analyticsData.totalViews,
    total_likes: analyticsData.totalLikes,
    total_comments: analyticsData.totalComments,
    average_view_duration: Math.floor(Math.random() * 300),
    engagement_rate: analyticsData.totalViews > 0 
      ? ((analyticsData.totalLikes + analyticsData.totalComments) / analyticsData.totalViews * 100).toFixed(2)
      : '0.00',
    videos: analyticsData.videos
  };
}

async function getChannelVideos(token, limit = 25) {
  try {
    const { accessToken, channelId } = token;

    console.log('Fetching YouTube videos for channel:', channelId);

    const channelResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          part: 'contentDetails',
          id: channelId,
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

    console.log('YouTube API response status:', videosResponse.status);

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

    console.log('YouTube videos fetched:', statsResponse.data.items?.length || 0, 'videos');

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
