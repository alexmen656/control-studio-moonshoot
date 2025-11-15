import axios from 'axios';

export async function fetchInstagramAnalytics(token, metadata) {
    console.log('   Calling Instagram Analytics API...');

    const instagramToken = {
        accessToken: token.sub.accessToken,
        instagramUserId: token.sub.instagramUserId
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

    const instagramData = await getUserMedia(instagramToken);

    if (instagramData && instagramData.data && instagramData.data.media) {
        analyticsData.total.videos = instagramData.data.media.length;
        analyticsData.videos = instagramData.data.media.map(media => ({
            platform: 'instagram',
            id: media.id,
            title: media.caption ? media.caption.substring(0, 50) + '...' : 'No caption',
            views: media.video_views || media.reach || 0,
            likes: media.likes || 0,
            comments: media.comments || 0,
            shares: media.shares || 0
        }));

        instagramData.data.media.forEach(media => {
            analyticsData.total.views += media.video_views || media.reach || 0;
            analyticsData.total.likes += media.likes || 0;
            analyticsData.total.comments += media.comments || 0;
            analyticsData.total.shares += media.shares || 0;
        });
    }

    console.log('Instagram analytics data compiled:', analyticsData);
    //console.log('Instagram analytics data finished');

    try {
        const { instagramUserId, accessToken } = instagramToken;
        const apiVersion = 'v21.0';
        const channelUrl = `https://graph.facebook.com/${apiVersion}/${instagramUserId}`;
        const channelParams = {
            fields: 'followers_count,biography',
            access_token: accessToken
        };
        const channelResponse = await axios.get(channelUrl, { params: channelParams });
        const followers = channelResponse.data.followers_count || 0;

        return {
            platform: 'instagram',
            followers: followers,
            total: {
                posts: analyticsData.total.videos,
                views: analyticsData.total.views,
                likes: analyticsData.total.likes,
                comments: analyticsData.total.comments,
                shares: analyticsData.total.shares,
                reach: analyticsData.total.views,
                engagement_rate: analyticsData.total.videos > 0
                    ? ((analyticsData.total.likes + analyticsData.total.comments + analyticsData.total.shares) / (analyticsData.total.views || 1) * 100).toFixed(2)
                    : 0
            },
            videos: analyticsData.videos
        };
    } catch (err) {
        console.error('Error fetching Instagram channel info:', err.message);
        return {
            platform: 'instagram',
            followers: 0,
            total: {
                posts: analyticsData.total.videos,
                views: analyticsData.total.views,
                likes: analyticsData.total.likes,
                comments: analyticsData.total.comments,
                shares: analyticsData.total.shares,
                reach: analyticsData.total.views,
                engagement_rate: analyticsData.total.videos > 0
                    ? ((analyticsData.total.likes + analyticsData.total.comments + analyticsData.total.shares) / (analyticsData.total.views || 1) * 100).toFixed(2)
                    : 0
            },
            videos: analyticsData.videos
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
        //console.log(`Fetching insights for ${mediaProductType || mediaType} (${mediaType}) media ${mediaId} with metrics: ${metrics}`);
        const insightsResponse = await axios.get(insightsUrl, { params: insightsParams });
        //console.log(`Insights for media ${mediaId}:`, insightsResponse.data);

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