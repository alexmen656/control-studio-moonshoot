export async function fetchTikTokAnalytics(payload, metadata) {
  // Extract all needed info to get analytics from payload
  // Simulate
  console.log('   Calling TikTok Analytics API...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    platform: 'tiktok',
    followers: Math.floor(Math.random() * 50000),
    total_views: Math.floor(Math.random() * 500000),
    total_videos: Math.floor(Math.random() * 200),
    average_watch_time: Math.floor(Math.random() * 30),
    engagement_rate: (Math.random() * 15).toFixed(2)
  };
}
