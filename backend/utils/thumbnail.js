import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const thumbnailsDir = path.join(__dirname, '..', 'uploads', 'thumbnails');

if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
}

export async function generateThumbnail(videoPath, videoFilename, timestamp = 1) {
    return new Promise((resolve, reject) => {
        const thumbnailFilename = videoFilename.replace(/\.[^/.]+$/, '') + '.jpg';
        const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

        const ffmpegArgs = [
            '-ss', String(timestamp),
            '-i', videoPath,
            '-vframes', '1',
            '-q:v', '2',
            '-vf', 'scale=640:-1',
            '-y',
            thumbnailPath
        ];

        const ffmpeg = spawn('ffmpeg', ffmpegArgs);

        let stderr = '';

        ffmpeg.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ffmpeg.on('close', (code) => {
            if (code === 0 && fs.existsSync(thumbnailPath)) {
                console.log(`Thumbnail generated: ${thumbnailFilename}`);
                resolve({
                    thumbnailFilename,
                    thumbnailPath
                });
            } else {
                console.error(`Thumbnail generation failed for ${videoFilename}:`, stderr);
                resolve({
                    thumbnailFilename: null,
                    thumbnailPath: null
                });
            }
        });

        ffmpeg.on('error', (err) => {
            console.error(`Failed to start ffmpeg:`, err);
            resolve({
                thumbnailFilename: null,
                thumbnailPath: null
            });
        });
    });
}

export async function getVideoDuration(videoPath) {
    return new Promise((resolve) => {
        const ffprobeArgs = [
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            videoPath
        ];

        const ffprobe = spawn('ffprobe', ffprobeArgs);

        let stdout = '';
        let stderr = '';

        ffprobe.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        ffprobe.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ffprobe.on('close', (code) => {
            if (code === 0 && stdout.trim()) {
                const durationSeconds = parseFloat(stdout.trim());
                const minutes = Math.floor(durationSeconds / 60);
                const seconds = Math.floor(durationSeconds % 60);
                resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            } else {
                console.error('ffprobe failed:', stderr);
                resolve('0:00');
            }
        });

        ffprobe.on('error', (err) => {
            console.error('Failed to start ffprobe:', err);
            resolve('0:00');
        });
    });
}

export function deleteThumbnail(thumbnailFilename) {
    if (!thumbnailFilename) return;

    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
    if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
        console.log(`Thumbnail deleted: ${thumbnailFilename}`);
    }
}

export { thumbnailsDir };
