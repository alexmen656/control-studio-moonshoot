import express from 'express';
import * as db from '../utils/db.js'

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    const query = `
      SELECT id, username, email 
      FROM users 
      WHERE username ILIKE $1 OR email ILIKE $1
      ORDER BY username
      LIMIT 20
    `;
    const result = await db.query(query, [`%${q}%`]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;
