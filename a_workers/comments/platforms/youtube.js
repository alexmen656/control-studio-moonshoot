import axios from 'axios';

export async function fetchYouTubeComments(token, metadata) {
  console.log('   Calling YouTube Comments API...');
  console.log(metadata);

  const youtubeToken = {
    accessToken: token.sub.access_token,
    channelId: token.sub.channelId
  };

  const commentsData = {
    totalComments: 0,
    totalVideos: 0,
    videos: []
  };

  const youtubeData = await getChannelVideos(youtubeToken);

  if (youtubeData && youtubeData.data && youtubeData.data.videos) {
    commentsData.totalVideos = youtubeData.data.videos.length;
    
    for (const video of youtubeData.data.videos) {
      const videoComments = await getVideoComments(youtubeToken, video.id);
      const comments = videoComments.data || [];
      
      commentsData.totalComments += comments.length;
      commentsData.videos.push({
        platform: 'youtube',
        videoId: video.id,
        videoTitle: video.title || 'No title',
        commentCount: comments.length,
        comments: comments.map(comment => ({
          id: comment.id,
          author: comment.authorDisplayName || 'Unknown',
          text: comment.textDisplay || '',
          likeCount: comment.likeCount || 0,
          replyCount: comment.replyCount || 0,
          publishedAt: comment.publishedAt || ''
        }))
      });
    }
  }

  console.log('YouTube comments data compiled:', commentsData);

  return {
    platform: 'youtube',
    total_videos: commentsData.totalVideos,
    total_comments: commentsData.totalComments,
    videos: commentsData.videos
  };
}


async function getVideoComments(token, videoId, limit = 100) {
  try {
    const { accessToken } = token;

    console.log('Fetching comments for video:', videoId);

    const url = 'https://www.googleapis.com/youtube/v3/commentThreads';

    const params = {
      part: 'snippet',
      videoId: videoId,
      maxResults: limit,
      access_token: accessToken,
      textFormat: 'plainText'
    };

    const response = await axios.get(url, { 
      params,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('YouTube comments API response status:', response.status);

    if (response.data.error) {
      console.warn('YouTube API returned an error:', response.data.error);
      return {
        data: [],
        status: response.status
      };
    }

    const comments = (response.data.items || []).map(item => item.snippet.topLevelComment.snippet);
    
    console.log('Comments fetched for video', videoId, ':', comments.length, 'comments');

    return {
      data: comments,
      status: response.status
    };
  } catch (error) {
    console.error('Error getting comments for video:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return {
      data: [],
      status: error.response?.status || 500
    };
  }
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
