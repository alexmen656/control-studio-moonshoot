import axios from 'axios';

export async function fetchInstagramAnalytics(token, metadata) {
    console.log('   Calling Instagram Analytics API...');
    console.log(metadata);

    const instagramToken = {
        accessToken: token.sub.accessToken,
        instagramUserId: token.sub.instagramUserId
    };

   // await new Promise(resolve => setTimeout(resolve, 5000));

   const analytics = await getTotalAnalytics(instagramToken, 'impressions', 'day');//,reach,profile_views,website_clicks
    console.log('Instagram analytics fetched:', analytics);
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
async function getUserMedia(projectId = this.projectId, limit = 25) {
    try {
        console.log('Fetching Instagram user media for project ID:', projectId);
        const { instagramUserId, accessToken } = await this._getCredentials(projectId);

        console.log('Fetching Instagram media for user:', instagramUserId);

        const apiVersion = 'v21.0'
        const mediaUrl = `https://graph.facebook.com/${apiVersion}/${instagramUserId}/media`;
        const mediaParams = {
            fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
            access_token: accessToken,
            limit: limit
        };

        const mediaResponse = await axios.get(mediaUrl, { params: mediaParams });

        console.log('Instagram media fetched:', mediaResponse.data.data?.length || 0, 'posts');

        const mediaWithInsights = [];

        for (const media of mediaResponse.data.data || []) {
            try {
                if (['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(media.media_type)) {
                    const insights = await _getMediaInsights(media.id, accessToken);

                    mediaWithInsights.push({
                        id: media.id,
                        caption: media.caption || '',
                        media_type: media.media_type,
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

async function _getMediaInsights(mediaId, accessToken) {
    const apiVersion = 'v21.0';
    const insightsUrl = `https://graph.facebook.com/${apiVersion}/${mediaId}/insights`;
    const insightsParams = {
        metric: 'impressions,reach,engagement,saved,video_views,shares',
        access_token: accessToken
    };

    try {
        const insightsResponse = await axios.get(insightsUrl, { params: insightsParams });

        const insights = {
            impressions: 0,
            reach: 0,
            engagement: 0,
            saved: 0,
            video_views: 0,
            shares: 0
        };

        insightsResponse.data.data?.forEach(metric => {
            insights[metric.name] = metric.values?.[0]?.value || 0;
        });

        return insights;
    } catch (insightError) {
        console.warn(`Could not fetch insights for media ${mediaId}:`, insightError.message);
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