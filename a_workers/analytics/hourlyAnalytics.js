export async function fetchHourlyAnalytics(job) {
    console.log(`   Fetching hourly analytics for ${job.platform}...`);

    // Simulate hourly analytics fetch
    await new Promise(resolve => setTimeout(resolve, 1500));

    const hours = job.metadata?.hours || 24;
    const hourlyData = [];

    for (let i = 0; i < hours; i++) {
        hourlyData.push({
            hour: new Date(Date.now() - i * 3600000).toISOString(),
            views: Math.floor(Math.random() * 1000),
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50)
        });
    }

    return {
        platform: job.platform,
        hourly_data: hourlyData,
        fetched_at: new Date().toISOString()
    };
}