import axios from 'axios';

export async function fetchRedditAnalytics(token, metadata) {
  console.log('   Calling Reddit Analytics API...');
  console.log(metadata);

  const redditToken = {
    accessToken: token.sub.access_token,
    username: token.sub.username
  };

  const analyticsData = {
    totalScore: 0,
    totalUpvotes: 0,
    totalComments: 0,
    totalPosts: 0,
    posts: []
  };

  const redditData = await getUserPosts(redditToken);

  if (redditData && redditData.data && redditData.data.posts) {
    analyticsData.totalPosts = redditData.data.posts.length;
    analyticsData.posts = redditData.data.posts.map(post => ({
      platform: 'reddit',
      id: post.id,
      title: post.title ? post.title.substring(0, 50) + '...' : 'No title',
      views: post.upvotes || post.score || 0,
      likes: post.upvotes || 0,
      comments: post.num_comments || 0,
      shares: 0
    }));

    redditData.data.posts.forEach(post => {
      analyticsData.totalScore += post.score || 0;
      analyticsData.totalUpvotes += post.upvotes || 0;
      analyticsData.totalComments += post.num_comments || 0;
    });
  }

  console.log('Reddit analytics data compiled:', analyticsData);

  return {
    platform: 'reddit',
    karma: analyticsData.totalScore,
    total_posts: analyticsData.totalPosts,
    total_upvotes: analyticsData.totalUpvotes,
    total_comments: analyticsData.totalComments,
    average_score: analyticsData.totalPosts > 0 
      ? (analyticsData.totalScore / analyticsData.totalPosts).toFixed(2)
      : '0.00',
    posts: analyticsData.posts
  };
}

async function getUserPosts(token, limit = 25) {
  try {
    const { accessToken, username } = token;

    console.log('Fetching Reddit posts for user:', username);

    const response = await axios.get(
      `https://oauth.reddit.com/user/${username}/submitted`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'ReelmiaAnalytics/1.0'
        },
        params: {
          limit: limit
        },
        validateStatus: function (status) {
          return status < 500;
        }
      }
    );

    console.log('Reddit API response status:', response.status);

    if (response.data.error || response.status === 401) {
      console.warn('Reddit API returned an error:', response.data.error || 'Unauthorized');
      if (!response.data.data || !response.data.data.children || response.data.data.children.length === 0) {
        throw new Error(`Reddit API error: ${response.data.error || 'Unknown error'}`);
      }
    }

    const posts = response.data.data?.children?.map(item => item.data) || [];
    console.log('Reddit posts fetched:', posts.length, 'posts');

    return {
      data: {
        posts: posts
      },
      status: response.status
    };
  } catch (error) {
    console.error('Error getting Reddit posts:', error.message);
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