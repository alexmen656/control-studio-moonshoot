import axios from 'axios';

export async function fetchFacebookAnalytics(token, metadata) {
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

  const facebookData = await getPagePosts(facebookToken);

  if (facebookData && facebookData.data && facebookData.data.posts) {
    analyticsData.totalPosts = facebookData.data.posts.length;
    analyticsData.posts = facebookData.data.posts.map(post => ({
      platform: 'facebook',
      id: post.id,
      title: post.message ? post.message.substring(0, 50) + '...' : 'No message',
      views: post.impressions?.reach || 0,
      likes: post.reactions?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0
    }));

    facebookData.data.posts.forEach(post => {
      analyticsData.totalViews += post.impressions?.reach || 0;
      analyticsData.totalLikes += post.reactions?.summary?.total_count || 0;
      analyticsData.totalComments += post.comments?.summary?.total_count || 0;
      analyticsData.totalShares += post.shares?.count || 0;
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

async function getPagePosts(token, limit = 25) {
  try {
    const { accessToken, pageId } = token;
    const apiVersion = 'v24.0';
    const url = `https://graph.facebook.com/${apiVersion}/${pageId}/posts`;

    const params = {
      fields: 'id,message,created_time,shares,reactions.summary(total_count),comments.summary(total_count)',
      access_token: accessToken,
      limit: limit
    };

    const response = await axios.get(url, {
      params,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('Facebook API Response status:', response.status);
    
    if (response.data.error) {
      console.warn('Facebook API returned an error:', response.data.error);
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error(`Facebook API error: ${response.data.error.message || 'Unknown error'}`);
      }
    }

    const postsWithData = await Promise.all(
      (response.data.data || []).map(async (post) => {
        const impressions = await getPostImpressions(post.id, accessToken, apiVersion);
        return {
          ...post,
          impressions: impressions
        };
      })
    );

    return {
      data: {
        posts: postsWithData
      },
      status: response.status
    };
  } catch (error) {
    console.error('Error getting Facebook page posts:', error.message);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }

    return {
      data: { posts: [] },
      status: error.response?.status || 500
    };
  }
}

async function getPostImpressions(postId, accessToken, apiVersion) {
  try {
    const url = `https://graph.facebook.com/${apiVersion}/${postId}/insights`;
    const params = {
      metric: 'post_impressions_unique',
      access_token: accessToken
    };

    const response = await axios.get(url, {
      params,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    const insightsData = {
      reach: 0,
      shares: 0
    };

    if (response.data?.data) {
      response.data.data.forEach(metric => {
        if (metric.name === 'post_impressions_unique') {
          insightsData.reach = metric.values?.[0]?.value || 0;
        }
      });
    }

    return insightsData;
  } catch (error) {
    console.error(`Error getting impressions for post ${postId}:`, error.message);
    return { reach: 0, shares: 0 };
  }
}
