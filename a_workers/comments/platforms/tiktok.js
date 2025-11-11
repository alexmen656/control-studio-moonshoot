import axios from 'axios';

export async function fetchTikTokComments(token, metadata) {
    console.log('   Calling TikTok Comments API...');
    console.log(metadata);

    const tiktokToken = {
        accessToken: token.sub.access_token
    };

    const commentsData = {
        totalComments: 0,
        totalVideos: 0,
        videos: []
    };

    const tiktokData = await getUserVideos(tiktokToken);

    if (tiktokData && tiktokData.data && tiktokData.data.videos) {
        commentsData.totalVideos = tiktokData.data.videos.length;
        
        for (const video of tiktokData.data.videos) {
            const videoComments = await getVideoComments(tiktokToken, video.id);
            const comments = videoComments.data || [];
            
            commentsData.totalComments += comments.length;
            commentsData.videos.push({
                platform: 'tiktok',
                videoId: video.id,
                videoTitle: video.title || video.video_description?.substring(0, 100) || 'No title',
                commentCount: comments.length,
                comments: comments.map(comment => ({
                    id: comment.id,
                    author: comment.author_name || 'Unknown',
                    text: comment.text || '',
                    likeCount: comment.like_count || 0,
                    createTime: comment.create_time || ''
                }))
            });
        }
    }

    console.log('TikTok comments data compiled:', commentsData);

    return {
        platform: 'tiktok',
        total_videos: commentsData.totalVideos,
        total_comments: commentsData.totalComments,
        videos: commentsData.videos
    };
}


async function getVideoComments(token, videoId, limit = 100) {
    try {
        const { accessToken } = token;

        console.log('Fetching comments for video:', videoId);

        const url = 'https://open.tiktokapis.com/v2/video/comment/list/';

        const requestBody = {
            video_id: videoId,
            fields: ['id', 'text', 'author_name', 'like_count', 'create_time']
        };

        const response = await axios.post(url, requestBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            validateStatus: function (status) {
                return status < 500;
            }
        });

        console.log('TikTok comments API response status:', response.status);

        if (response.data.error) {
            console.warn('TikTok API returned an error:', response.data.error);
            return {
                data: [],
                status: response.status
            };
        }

        console.log('Comments fetched for video', videoId, ':', response.data.data?.comments?.length || 0, 'comments');

        return {
            data: response.data.data?.comments || [],
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

async function getUserVideos(token) {
    try {
        const { accessToken } = token;

        console.log('Fetching TikTok videos...');
        console.log('Access token present:', !!accessToken);

        const requestBody = {
            fields: [
                "id",
                "title",
                "create_time",
                "duration",
                "cover_image_url",
                "share_url",
                "video_description",
                "statistics"
            ]
        };

        const response = await axios.post(
            'https://open.tiktokapis.com/v2/video/query/',
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                validateStatus: function (status) {
                    return status < 500;
                }
            }
        );

        console.log('TikTok API response status:', response.status);
        console.log('TikTok API response:', JSON.stringify(response.data, null, 2));

        if (response.data.error) {
            console.warn('TikTok API returned an error:', response.data.error);
            if (!response.data.data || !response.data.data.videos || response.data.data.videos.length === 0) {
                throw new Error(`TikTok API error: ${response.data.error.message || 'Unknown error'}`);
            }
        }

        console.log('TikTok videos fetched:', response.data.data?.videos?.length || 0, 'videos');

        return {
            data: response.data.data || { videos: [] },
            status: response.status
        };
    } catch (error) {
        console.error('Error getting TikTok user videos:', error.message);
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