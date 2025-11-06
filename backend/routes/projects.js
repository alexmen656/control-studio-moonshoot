import express from 'express';
import * as db from '../utils/db.js'
import { getDefaultRegion } from '../utils/regions.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const query = `
      SELECT 
        p.*,
        COUNT(v.id) as video_count
      FROM projects p
      LEFT JOIN videos v ON v.project_id = p.id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    const result = await db.query(query, [user_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, initials, color1, color2, user_id } = req.body;

    if (!name || !initials || !color1 || !color2 || !user_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const defaultRegion = getDefaultRegion();

    const query = `
      INSERT INTO projects (name, initials, color1, color2, user_id, region_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [name, initials, color1, color2, user_id, defaultRegion.id]);
    const project = result.rows[0];

    const memberQuery = 'INSERT INTO project_users (project_id, user_id) VALUES ($1, $2)';
    await db.query(memberQuery, [project.id, user_id]);

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, initials, color1, color2 } = req.body;

    const query = `
      UPDATE projects 
      SET name = $1, initials = $2, color1 = $3, color2 = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await db.query(query, [name, initials, color1, color2, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, initials, color1, color2 } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (initials !== undefined) {
      updates.push(`initials = $${paramCount}`);
      values.push(initials);
      paramCount++;
    }
    if (color1 !== undefined) {
      updates.push(`color1 = $${paramCount}`);
      values.push(color1);
      paramCount++;
    }
    if (color2 !== undefined) {
      updates.push(`color2 = $${paramCount}`);
      values.push(color2);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.get('/:id/users', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT u.id, u.username, u.email 
      FROM users u
      INNER JOIN project_users pu ON u.id = pu.user_id
      WHERE pu.project_id = $1
      ORDER BY u.username
    `;
    const result = await db.query(query, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project users:', error);
    res.status(500).json({ error: 'Failed to fetch project users' });
  }
});

router.post('/:id/users', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const checkQuery = 'SELECT * FROM project_users WHERE project_id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, user_id]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'User already in project' });
    }

    const query = 'INSERT INTO project_users (project_id, user_id) VALUES ($1, $2) RETURNING *';
    await db.query(query, [id, user_id]);

    res.json({ message: 'User added to project successfully' });
  } catch (error) {
    console.error('Error adding user to project:', error);
    res.status(500).json({ error: 'Failed to add user to project' });
  }
});

router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    const query = 'DELETE FROM project_users WHERE project_id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in project' });
    }

    res.json({ message: 'User removed from project successfully' });
  } catch (error) {
    console.error('Error removing user from project:', error);
    res.status(500).json({ error: 'Failed to remove user from project' });
  }
});

router.patch('/:id/preferred-worker', async (req, res) => {
  try {
    const { id } = req.params;
    const { worker_id } = req.body;

    if (worker_id) {
      const workerCheck = await db.query(
        'SELECT worker_id, worker_name, status FROM workers WHERE worker_id = $1',
        [worker_id]
      );

      if (workerCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Worker not found' });
      }

      if (workerCheck.rows[0].status !== 'online') {
        return res.status(400).json({
          error: 'Cannot set offline worker as preferred',
          worker_status: workerCheck.rows[0].status
        });
      }
    }

    const query = `
      UPDATE projects 
      SET preferred_worker_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [worker_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Preferred worker updated',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating preferred worker:', error);
    res.status(500).json({ error: 'Failed to update preferred worker' });
  }
});

router.patch('/:id/region', async (req, res) => {
  try {
    const { id } = req.params;
    const { region_id } = req.body;

    if (!region_id) {
      return res.status(400).json({ error: 'Region ID is required' });
    }

    const { isValidRegion } = await import('../utils/regions.js');
    if (!isValidRegion(region_id)) {
      return res.status(400).json({ error: 'Invalid region ID' });
    }

    const query = `
      UPDATE projects 
      SET region_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [region_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project region:', error);
    res.status(500).json({ error: 'Failed to update project region' });
  }
});

export default router;
