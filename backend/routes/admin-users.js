import express from 'express';
import { authMiddleware, adminMiddleware } from '../utils/auth.js';
import * as db from '../utils/db.js';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        email, 
        username, 
        full_name, 
        role,
        created_at, 
        last_login,
        google_id
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      users: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }

    if (role === 'user') {
      const adminCount = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE role = $1',
        ['admin']
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        const currentUser = await db.query(
          'SELECT role FROM users WHERE id = $1',
          [id]
        );

        if (currentUser.rows[0]?.role === 'admin') {
          return res.status(400).json({
            error: 'Cannot demote the last admin. Create another admin first.'
          });
        }
      }
    }

    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, username, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.query('SELECT role FROM users WHERE id = $1', [id]);

    if (user.rows[0]?.role === 'admin') {
      const adminCount = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE role = $1',
        ['admin']
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res.status(400).json({
          error: 'Cannot delete the last admin'
        });
      }
    }

    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email, username',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        id, 
        email, 
        username, 
        full_name, 
        role,
        created_at, 
        last_login,
        google_id
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
