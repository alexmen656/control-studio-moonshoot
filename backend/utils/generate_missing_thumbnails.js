import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateThumbnail, getVideoDuration } from './thumbnail.js';
import * as db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

async function generateMissingThumbnails() {
    console.log('Starting thumbnail generation for existing videos...\n');

    try {
        const result = await db.query('SELECT id, filename, thumbnail, duration FROM videos ORDER BY id');
        const videos = result.rows;

        console.log(`Found ${videos.length} videos in database\n`);

        let generated = 0;
        let skipped = 0;
        let failed = 0;

        for (const video of videos) {
            if (video.thumbnail && !video.thumbnail.startsWith('http')) {
                console.log(`[SKIP] ${video.filename} - already has thumbnail: ${video.thumbnail}`);
                skipped++;
                continue;
            }

            const videoPath = path.join(uploadsDir, video.filename);
            if (!fs.existsSync(videoPath)) {
                console.log(`[SKIP] ${video.filename} - video file not found`);
                skipped++;
                continue;
            }

            console.log(`[PROCESSING] ${video.filename}...`);

            try {
                const thumbnailResult = await generateThumbnail(videoPath, video.filename);

                let duration = video.duration;
                if (!duration || duration === '0:00') {
                    duration = await getVideoDuration(videoPath);
                }

                if (thumbnailResult.thumbnailFilename) {
                    await db.query(
                        'UPDATE videos SET thumbnail = $1, duration = $2 WHERE id = $3',
                        [thumbnailResult.thumbnailFilename, duration, video.id]
                    );
                    console.log(`[SUCCESS] ${video.filename} -> ${thumbnailResult.thumbnailFilename} (duration: ${duration})`);
                    generated++;
                } else {
                    console.log(`[FAILED] ${video.filename} - thumbnail generation failed`);
                    failed++;
                }
            } catch (error) {
                console.error(`[ERROR] ${video.filename}:`, error.message);
                failed++;
            }
        }

        console.log('\n========================================');
        console.log('Thumbnail Generation Complete!');
        console.log('========================================');
        console.log(`Generated: ${generated}`);
        console.log(`Skipped: ${skipped}`);
        console.log(`Failed: ${failed}`);
        console.log(`Total: ${videos.length}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

generateMissingThumbnails();
