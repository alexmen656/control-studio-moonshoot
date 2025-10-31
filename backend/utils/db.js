import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const pool = new Pool({
    connectionString: process.env.PROGRESS_STRING,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export const query = (text, params) => pool.query(text, params);

const toCamelCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            result[camelKey] = toCamelCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
};

export const getAllVideos = async () => {
    const result = await pool.query(`
    SELECT 
      v.*,
      COALESCE(
        json_agg(DISTINCT vp.platform) FILTER (WHERE vp.platform IS NOT NULL),
        '[]'
      ) as platforms,
      COALESCE(
        json_agg(DISTINCT vt.tag) FILTER (WHERE vt.tag IS NOT NULL),
        '[]'
      ) as tags,
      COALESCE(
        json_object_agg(ps.platform, ps.status) FILTER (WHERE ps.platform IS NOT NULL),
        '{}'
      ) as publish_status
    FROM videos v
    LEFT JOIN video_platforms vp ON v.id = vp.video_id
    LEFT JOIN video_tags vt ON v.id = vt.video_id
    LEFT JOIN publish_status ps ON v.id = ps.video_id
    GROUP BY v.id
    ORDER BY v.upload_date DESC
  `);
    return result.rows.map(row => toCamelCase(row));
};

export const getVideoById = async (id) => {
    const result = await pool.query(`
    SELECT 
      v.*,
      COALESCE(
        json_agg(DISTINCT vp.platform) FILTER (WHERE vp.platform IS NOT NULL),
        '[]'
      ) as platforms,
      COALESCE(
        json_agg(DISTINCT vt.tag) FILTER (WHERE vt.tag IS NOT NULL),
        '[]'
      ) as tags,
      COALESCE(
        json_object_agg(ps.platform, ps.status) FILTER (WHERE ps.platform IS NOT NULL),
        '{}'
      ) as publish_status
    FROM videos v
    LEFT JOIN video_platforms vp ON v.id = vp.video_id
    LEFT JOIN video_tags vt ON v.id = vt.video_id
    LEFT JOIN publish_status ps ON v.id = ps.video_id
    WHERE v.id = $1
    GROUP BY v.id
  `, [id]);
    return result.rows[0] ? toCamelCase(result.rows[0]) : null;
};

export const createVideo = async (videoData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(`
      INSERT INTO videos (
        id, title, filename, original_name, thumbnail, duration, 
        size, size_bytes, upload_date, status, progress, views, path, project_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
            videoData.id,
            videoData.title,
            videoData.filename,
            videoData.originalName,
            videoData.thumbnail,
            videoData.duration,
            videoData.size,
            videoData.sizeBytes,
            videoData.uploadDate,
            videoData.status,
            videoData.progress,
            videoData.views,
            videoData.path,
            videoData.project_id
        ]);

        const video = result.rows[0];

        if (videoData.platforms && videoData.platforms.length > 0) {
            for (const platform of videoData.platforms) {
                await client.query(
                    'INSERT INTO video_platforms (video_id, platform) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [video.id, platform]
                );
            }
        }

        await client.query('COMMIT');
        return await getVideoById(video.id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const updateVideo = async (id, updates) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const fields = [];
        const values = [];
        let paramCount = 1;

        const allowedFields = [
            'title', 'thumbnail', 'duration', 'size', 'size_bytes',
            'status', 'progress', 'views', 'description',
            'scheduled_date', 'published_at'
        ];

        Object.entries(updates).forEach(([key, value]) => {
            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            if (allowedFields.includes(dbKey)) {
                fields.push(`${dbKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length > 0) {
            fields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            await client.query(
                `UPDATE videos SET ${fields.join(', ')} WHERE id = $${paramCount}`,
                values
            );
        }

        if (updates.platforms) {
            await client.query('DELETE FROM video_platforms WHERE video_id = $1', [id]);
            for (const platform of updates.platforms) {
                await client.query(
                    'INSERT INTO video_platforms (video_id, platform) VALUES ($1, $2)',
                    [id, platform]
                );
            }
        }

        if (updates.tags) {
            await client.query('DELETE FROM video_tags WHERE video_id = $1', [id]);
            for (const tag of updates.tags) {
                await client.query(
                    'INSERT INTO video_tags (video_id, tag) VALUES ($1, $2)',
                    [id, tag]
                );
            }
        }

        if (updates.publishStatus) {
            for (const [platform, status] of Object.entries(updates.publishStatus)) {
                await client.query(`
          INSERT INTO publish_status (video_id, platform, status, published_at, updated_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT (video_id, platform) 
          DO UPDATE SET status = $3, published_at = $4, updated_at = CURRENT_TIMESTAMP
        `, [id, platform, status, status === 'failed' ? null : new Date()]);
            }
        }

        await client.query('COMMIT');
        return await getVideoById(id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const deleteVideo = async (id) => {
    await pool.query('DELETE FROM videos WHERE id = $1', [id]);
};

export const bulkDeleteVideos = async (ids) => {
    await pool.query('DELETE FROM videos WHERE id = ANY($1)', [ids]);
};

export const getTotalStorageUsed = async () => {
    const result = await pool.query('SELECT COALESCE(SUM(size_bytes), 0) as total FROM videos');
    return parseInt(result.rows[0].total);
};

export const getVideosByProjectId = async (projectId) => {
    const result = await pool.query(`
    SELECT 
      v.*,
      COALESCE(
        json_agg(DISTINCT vp.platform) FILTER (WHERE vp.platform IS NOT NULL),
        '[]'
      ) as platforms,
      COALESCE(
        json_agg(DISTINCT vt.tag) FILTER (WHERE vt.tag IS NOT NULL),
        '[]'
      ) as tags,
      COALESCE(
        json_object_agg(ps.platform, ps.status) FILTER (WHERE ps.platform IS NOT NULL),
        '{}'
      ) as publish_status
    FROM videos v
    LEFT JOIN video_platforms vp ON v.id = vp.video_id
    LEFT JOIN video_tags vt ON v.id = vt.video_id
    LEFT JOIN publish_status ps ON v.id = ps.video_id
    WHERE v.project_id = $1
    GROUP BY v.id
    ORDER BY v.upload_date DESC
  `, [projectId]);
    return result.rows.map(row => toCamelCase(row));
};

export default pool;