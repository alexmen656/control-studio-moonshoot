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

export async function fetchYouTubeComments(token, metadata) {
  console.log('   Calling YouTube Comments API...');
  console.log(metadata);

  const accessToken = token.sub.access_token;
  const refreshToken = token.sub.refresh_token;

  const oauth2Client = createOAuth2Client(accessToken, refreshToken);
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const commentsData = {
    totalComments: 0,
    totalVideos: 0,
    videos: []
  };

  const youtubeData = await getChannelVideos(youtube);

  if (youtubeData && youtubeData.videos) {
    commentsData.totalVideos = youtubeData.videos.length;

    for (const video of youtubeData.videos) {
      const videoComments = await getVideoComments(youtube, video.id);
      const comments = videoComments || [];

      commentsData.totalComments += comments.length;
      commentsData.videos.push({
        platform: 'youtube',
        videoId: video.id,
        videoTitle: video.snippet?.title || 'No title',
        commentCount: comments.length,
        comments: comments.map(comment => ({
          id: comment.id,
          author: comment.authorDisplayName || 'Unknown',
          text: comment.textDisplay || '',
          likeCount: comment.likeCount || 0,
          replyCount: comment.totalReplyCount || 0,
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


async function getVideoComments(youtube, videoId, limit = 100) {
  try {
    console.log('Fetching comments for video:', videoId);

    const response = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: videoId,
      maxResults: limit,
      textFormat: 'plainText'
    });

    console.log('Comments fetched for video', videoId, ':', response.data.items?.length || 0, 'comments');

    return (response.data.items || []).map(item => ({
      id: item.id,
      ...item.snippet.topLevelComment.snippet,
      totalReplyCount: item.snippet.totalReplyCount || 0
    }));
  } catch (error) {
    console.error('Error getting comments for video:', error.message);

    if (error.code === 403) {
      console.warn('Comments disabled for video:', videoId);
    }

    return [];
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
      console.log('No videos found in uploads playlist');
      return { videos: [] };
    }

    const statsResponse = await youtube.videos.list({
      part: ['statistics', 'snippet'],
      id: videoIds
    });

    console.log('YouTube videos fetched:', statsResponse.data.items?.length || 0, 'videos');

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
