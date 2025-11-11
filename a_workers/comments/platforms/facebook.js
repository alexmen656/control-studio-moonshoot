import axios from 'axios';

export async function fetchFacebookComments(token, metadata) {
  console.log('   Calling Facebook Comments API...');
  console.log(metadata);

  const facebookToken = {
    accessToken: token.sub.access_token,
    pageId: token.sub.pageId
  };

  const commentsData = {
    totalComments: 0,
    totalPosts: 0,
    posts: []
  };

  const facebookData = await getPagePosts(facebookToken);

  if (facebookData && facebookData.data && facebookData.data.posts) {
    commentsData.totalPosts = facebookData.data.posts.length;
    
    for (const post of facebookData.data.posts) {
      const postComments = await getPostComments(facebookToken, post.id);
      const comments = postComments.data || [];
      
      commentsData.totalComments += comments.length;
      commentsData.posts.push({
        platform: 'facebook',
        postId: post.id,
        postTitle: post.message ? post.message.substring(0, 100) : 'No message',
        commentCount: comments.length,
        comments: comments.map(comment => ({
          id: comment.id,
          author: comment.from?.name || 'Unknown',
          text: comment.message || '',
          createdTime: comment.created_time || '',
          likes: comment.like_count || 0
        }))
      });
    }
  }

  console.log('Facebook comments data compiled:', commentsData);

  return {
    platform: 'facebook',
    total_posts: commentsData.totalPosts,
    total_comments: commentsData.totalComments,
    posts: commentsData.posts
  };
}


async function getPostComments(token, postId, limit = 100) {
  try {
    const { accessToken } = token;

    console.log('Fetching comments for post:', postId);

    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${postId}/comments`;

    const params = {
      fields: 'id,message,created_time,from.fields(name),like_count',
      access_token: accessToken,
      limit: limit
    };

    const response = await axios.get(url, { 
      params,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('Facebook comments API response status:', response.status);

    if (response.data.error) {
      console.warn('Facebook API returned an error:', response.data.error);
      return {
        data: [],
        status: response.status
      };
    }

    console.log('Comments fetched for post', postId, ':', response.data.data?.length || 0, 'comments');

    return {
      data: response.data.data || [],
      status: response.status
    };
  } catch (error) {
    console.error('Error getting comments for post:', error.message);
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

async function getPagePosts(token, limit = 25) {
  try {
    const { accessToken, pageId } = token;

    console.log('Fetching Facebook page posts for page:', pageId);

    const apiVersion = 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${pageId}/posts`;

    const params = {
      fields: 'id,message,created_time,type,permalink,reach,shares,likes.summary(true),comments.summary(true)',
      access_token: accessToken,
      limit: limit
    };

    const response = await axios.get(url, { 
      params,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log('Facebook API response status:', response.status);

    if (response.data.error) {
      console.warn('Facebook API returned an error:', response.data.error);
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error(`Facebook API error: ${response.data.error.message || 'Unknown error'}`);
      }
    }

    console.log('Facebook posts fetched:', response.data.data?.length || 0, 'posts');

    return {
      data: {
        posts: response.data.data || []
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