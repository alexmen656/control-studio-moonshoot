import axios from 'axios';

const API_VERSION = 'v24.0';

export async function fetchFacebookAnalytics(token) {
  console.log('   Calling Facebook Analytics API...');

  const facebookToken = {
    accessToken: token.sub.accessToken,
    pageId: token.sub.pageId
  };

  const analyticsData = {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalPosts: 0,
    posts: []
  };

  const videosData = await getPageVideos(facebookToken);

  if (videosData && videosData.data && videosData.data.videos) {
    analyticsData.totalPosts = videosData.data.videos.length;
    analyticsData.posts = videosData.data.videos.map(video => ({
      platform: 'facebook',
      id: video.id,
      title: video.title || 'Untitled',
      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || 0,
      shares: video.shares || 0
    }));

    videosData.data.videos.forEach(video => {
      analyticsData.totalViews += video.views || 0;
      analyticsData.totalLikes += video.likes || 0;
      analyticsData.totalComments += video.comments || 0;
      analyticsData.totalShares += video.shares || 0;
    });
  }

  console.log('Facebook analytics data compiled:', analyticsData);

  return {
    platform: 'facebook',
    total: {
      posts: analyticsData.totalPosts,
      views: analyticsData.totalViews,
      likes: analyticsData.totalLikes,
      comments: analyticsData.totalComments,
      shares: analyticsData.totalShares,
      reach: analyticsData.totalViews,
      engagement_rate: analyticsData.totalPosts > 0
        ? ((analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares) / (analyticsData.totalViews || 1) * 100).toFixed(2)
        : 0
    },
    videos: analyticsData.posts
  };
}

async function getPageVideos(token, limit = 50) {
  try {
    const { accessToken, pageId } = token;
    const url = `https://graph.facebook.com/${API_VERSION}/${pageId}/videos`;

    const params = {
      fields: 'id,title,description,created_time,length,permalink_url,likes.summary(true),comments.summary(true)',
      access_token: accessToken,
      limit: limit
    };

    const response = await axios.get(url, {
      params,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('Facebook Videos API Response status:', response.status);

    if (response.data.error) {
      console.warn('Facebook API returned an error:', response.data.error);
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error(`Facebook API error: ${response.data.error.message || 'Unknown error'}`);
      }
    }

    const videosWithInsights = await Promise.all(
      (response.data.data || []).map(async (video) => {
        const viewInsights = await getVideoViews(video.id, accessToken);
        return {
          id: video.id,
          title: video.title || video.description?.substring(0, 50) || 'Untitled',
          views: viewInsights.views,
          likes: video.likes?.summary?.total_count || 0,
          comments: video.comments?.summary?.total_count || 0,
          shares: 0
        };
      })
    );

    return {
      data: {
        videos: videosWithInsights
      },
      status: response.status
    };
  } catch (error) {
    console.error('Error getting Facebook page videos:', error.message);

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

async function getVideoViews(videoId, accessToken) {
  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${videoId}/video_insights`;
    const params = {
      metric: 'total_video_views,total_video_impressions',
      access_token: accessToken
    };

    const response = await axios.get(url, {
      params,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log(`Video ${videoId} insights response:`, JSON.stringify(response.data, null, 2));

    let views = 0;

    if (response.data?.data) {
      response.data.data.forEach(metric => {
        console.log(`  Metric: ${metric.name}, value: ${metric.values?.[0]?.value}`);
        if (metric.name === 'total_video_views' || metric.name === 'total_video_impressions') {
          const metricValue = metric.values?.[0]?.value || 0;
          if (metricValue > views) {
            views = metricValue;
          }
        }
      });
    }

    if (views === 0) {
      try {
        const videoUrl = `https://graph.facebook.com/${API_VERSION}/${videoId}`;
        const videoResponse = await axios.get(videoUrl, {
          params: {
            fields: 'views',
            access_token: accessToken
          },
          validateStatus: (status) => status < 500
        });
        console.log(`Video ${videoId} direct views response:`, JSON.stringify(videoResponse.data, null, 2));
        if (videoResponse.data?.views) {
          views = videoResponse.data.views;
        }
      } catch (e) {
        console.log(`Could not get direct views for video ${videoId}`);
      }
    }

    return { views };
  } catch (error) {
    console.error(`Error getting views for video ${videoId}:`, error.message);
    if (error.response) {
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return { views: 0 };
  }
}
