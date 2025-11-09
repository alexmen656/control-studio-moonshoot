import axios from 'axios';

export async function fetchInstagramAnalytics(token, metadata) {
    console.log('   Calling Instagram Analytics API...');
    console.log(metadata);

    const instagramToken = {
        accessToken: token.sub.accessToken,
        instagramUserId: token.sub.instagramUserId
    };

    // await new Promise(resolve => setTimeout(resolve, 5000));

    //const analytics = await getTotalAnalytics(instagramToken, 'impressions', 'day');//,reach,profile_views,website_clicks
    //console.log('Instagram analytics fetched:', analytics);
    const analyticsData = {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        videos: []
    };

    const instagramData = await getUserMedia(instagramToken);

    if (instagramData && instagramData.data && instagramData.data.media) {
        analyticsData.totalVideos = instagramData.data.media.length;
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
            analyticsData.totalViews += media.video_views || media.reach || 0;
            analyticsData.totalLikes += media.likes || 0;
            analyticsData.totalComments += media.comments || 0;
            analyticsData.totalShares += media.shares || 0;
        });
    }

    console.log('Instagram analytics data compiled:', analyticsData);

    return {
        platform: 'instagram',
        followers: Math.floor(Math.random() * 75000),
        total_posts: Math.floor(Math.random() * 300),
        total_reach: Math.floor(Math.random() * 200000),
        engagement_rate: (Math.random() * 8).toFixed(2)
    };
}

async function getTotalAnalytics(token, metric = 'reach', period = 'day') {//projectId
    //    const { instagramUserId, accessToken } = await this._getCredentials(projectId);
    const { instagramUserId, accessToken } = token;

    console.log('--------------------------------------------------------');
    console.log('Instagram User ID for analytics:', instagramUserId);

    const apiVersion = 'v21.0'
    const url = `https://graph.facebook.com/${apiVersion}/${instagramUserId}/insights`;

    const params = {
        metric: metric,
        period: period,
        access_token: accessToken
    };

    const response = await axios.get(url, { params });

    console.log('Total analytics data:', response.data);
    console.log('Total analytics values:', response.data.data?.values);

    return response.data;
}

// copied over from baceknd/platforms/Instagram.js
async function getUserMedia(token, limit = 25) {
    try {
        //console.log('Fetching Instagram user media for project ID:', projectId);
        const { instagramUserId, accessToken } = token;

        console.log('Fetching Instagram media for user:', instagramUserId);

        const apiVersion = 'v21.0'
        const mediaUrl = `https://graph.facebook.com/${apiVersion}/${instagramUserId}/media`;
        const mediaParams = {
            fields: 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
            access_token: accessToken,
            limit: limit
        };

        const mediaResponse = await axios.get(mediaUrl, { params: mediaParams });

        console.log('Instagram media fetched:', mediaResponse.data.data?.length || 0, 'posts');

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
        metrics = 'reach,total_interactions,likes,comments,shares,saved';//plays
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

/* async function getAccountInfo(projectId = this.projectId) {
     const { instagramUserId, accessToken } = await this._getCredentials(projectId);
     const url = `https://graph.facebook.com/${this.apiVersion}/${instagramUserId}`;

     const response = await axios.get(url, {
         params: {
             fields: 'username,name,profile_picture_url,followers_count,follows_count,media_count',
             access_token: accessToken
         }
     });

     return response.data;
 }*/