import express from 'express';
import { authMiddleware, adminMiddleware } from '../utils/auth.js';
import * as db from '../utils/db.js'

const router = express.Router();

//not used by workers only by admin panel
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.query(`
      UPDATE workers 
      SET status = 'offline' 
      WHERE status = 'online' 
        AND last_heartbeat < NOW() - INTERVAL '2 minutes'
    `);

    const result = await db.query(
      'SELECT * FROM workers ORDER BY registered_at DESC'
    );

    res.json({
      workers: result.rows,
      total: result.rows.length,
      online: result.rows.filter(w => w.status === 'online').length
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

router.get('/:workerId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { workerId } = req.params;

    const result = await db.query(
      'SELECT * FROM workers WHERE worker_id = $1',
      [workerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

export default router;
