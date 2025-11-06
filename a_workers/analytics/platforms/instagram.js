export async function fetchInstagramAnalytics(payload, metadata) {
  // Extract all needed info to get analytics from payload
  // Simulate
  console.log('   Calling Instagram Analytics API...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    platform: 'instagram',
    followers: Math.floor(Math.random() * 75000),
    total_posts: Math.floor(Math.random() * 300),
    total_reach: Math.floor(Math.random() * 200000),
    engagement_rate: (Math.random() * 8).toFixed(2)
  };
}
