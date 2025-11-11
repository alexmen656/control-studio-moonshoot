import axios from 'axios';

export async function fetchInstagramComments(token, metadata) {
    console.log('   Calling Instagram Comments API...');

    const instagramToken = {
        accessToken: token.sub.accessToken,
        instagramUserId: token.sub.instagramUserId
    };

    const commentsData = {
        totalComments: 0,
        totalVideos: 0,
        videos: []
    };

    const instagramData = await getUserMedia(instagramToken);

    if (instagramData && instagramData.data && instagramData.data.media) {
        commentsData.totalVideos = instagramData.data.media.length;
        
        for (const media of instagramData.data.media) {
            const mediaComments = await getMediaComments(instagramToken, media.id);
            const comments = mediaComments.data || [];
            
            commentsData.totalComments += comments.length;
            commentsData.videos.push({
                platform: 'instagram',
                mediaId: media.id,
                mediaTitle: media.caption ? media.caption.substring(0, 100) : 'No caption',
                mediaType: media.media_type || 'unknown',
                commentCount: comments.length,
                comments: comments.map(comment => ({
                    id: comment.id,
                    author: comment.from?.username || 'Unknown',
                    text: comment.text || '',
                    createdTime: comment.timestamp || '',
                    likes: comment.like_count || 0
                }))
            });
        }
    }

    console.log('Instagram comments data compiled:', commentsData);

    return {
        platform: 'instagram',
        total_videos: commentsData.totalVideos,
        total_comments: commentsData.totalComments,
        videos: commentsData.videos
    };
}

async function getMediaComments(token, mediaId, limit = 100) {
    try {
        const { accessToken } = token;

        //console.log('Fetching comments for media:', mediaId);

        const apiVersion = 'v21.0';
        const url = `https://graph.facebook.com/${apiVersion}/${mediaId}/comments`;

        const params = {
            fields: 'id,text,timestamp,from.fields(username),like_count',
            access_token: accessToken,
            limit: limit
        };

        const response = await axios.get(url, { 
            params,
            validateStatus: function (status) {
                return status < 500;
            }
        });

       // console.log('Instagram comments API response status:', response.status);

        if (response.data.error) {
            console.warn('Instagram API returned an error:', response.data.error);
            return {
                data: [],
                status: response.status
            };
        }

        //console.log('Comments fetched for media', mediaId, ':', response.data.data?.length || 0, 'comments');

        return {
            data: response.data.data || [],
            status: response.status
        };
    } catch (error) {
        console.error('Error getting comments for media:', error.message);
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

async function getUserMedia(token, limit = 25) {
    try {
        const { instagramUserId, accessToken } = token;

        const apiVersion = 'v21.0'
        const mediaUrl = `https://graph.facebook.com/${apiVersion}/${instagramUserId}/media`;
        const mediaParams = {
            fields: 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
            access_token: accessToken,
            limit: limit
        };

        const mediaResponse = await axios.get(mediaUrl, { params: mediaParams });
        const mediaWithInsights = [];

        for (const media of mediaResponse.data.data || []) {
            try {
                if (['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(media.media_type)) {
                    const insights = await _getMediaInsights(media.id, accessToken, media.media_type, media.media_product_type);

                    mediaWithInsights.push({
                        id: media.id,
                        caption: media.caption || '',
                        media_type: media.media_type,
                        media_product_type: media.media_product_type,
                        timestamp: media.timestamp,
                        likes: media.like_count || 0,
                        comments: media.comments_count || 0,
                        ...insights
                    });
                }
            } catch (error) {
                console.warn(`Error processing media ${media.id}:`, error.message);
            }
        }

        return {
            data: {
                media: mediaWithInsights
            },
            status: 200
        };
    } catch (error) {
        console.error('Error getting Instagram user media:', error);
        throw error;
    }
}

async function _getMediaInsights(mediaId, accessToken, mediaType, mediaProductType) {
    const apiVersion = 'v21.0';
    const insightsUrl = `https://graph.facebook.com/${apiVersion}/${mediaId}/insights`;
    let metrics;

    if (mediaProductType === 'REELS') {
        metrics = 'reach,total_interactions,likes,comments,shares,saved';
    } else if (mediaType === 'VIDEO') {
        metrics = 'impressions,reach,saved,video_views,shares';
    } else if (mediaType === 'IMAGE') {
        metrics = 'impressions,reach,saved,shares';
    } else if (mediaType === 'CAROUSEL_ALBUM') {
        metrics = 'impressions,reach,saved,shares,carousel_album_engagement';
    } else {
        metrics = 'impressions,reach,saved';
    }

    const insightsParams = {
        metric: metrics,
        access_token: accessToken
    };

    try {
        console.log(`Fetching insights for ${mediaProductType || mediaType} (${mediaType}) media ${mediaId} with metrics: ${metrics}`);
        const insightsResponse = await axios.get(insightsUrl, { params: insightsParams });
        console.log(`Insights for media ${mediaId}:`, insightsResponse.data);

        const insights = {
            impressions: 0,
            reach: 0,
            engagement: 0,
            saved: 0,
            video_views: 0,
            shares: 0,
            plays: 0,
            total_interactions: 0,
            likes: 0,
            comments: 0
        };

        insightsResponse.data.data?.forEach(metric => {
            if (metric.name === 'carousel_album_engagement') {
                insights.engagement = metric.values?.[0]?.value || 0;
            } else if (metric.name === 'total_interactions') {
                insights.engagement = metric.values?.[0]?.value || 0;
            } else if (metric.name === 'plays') {
                insights.video_views = metric.values?.[0]?.value || 0;
                insights.plays = metric.values?.[0]?.value || 0;
            } else {
                insights[metric.name] = metric.values?.[0]?.value || 0;
            }
        });

        return insights;
    } catch (insightError) {
        console.warn(`Could not fetch insights for media ${mediaId}:`, insightError.response?.data || insightError.message);
        return {
            impressions: 0,
            reach: 0,
            engagement: 0,
            saved: 0,
            video_views: 0,
            shares: 0
        };
    }
}