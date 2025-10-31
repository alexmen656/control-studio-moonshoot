import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from './db.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const SALT_ROUNDS = 10;

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export const registerUser = async (email, username, password, fullName = null) => {
    try {
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('User with this email or username already exists');
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await query(
            'INSERT INTO users (email, username, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, email, username, full_name, created_at',
            [email, username, passwordHash, fullName]
        );

        const user = result.rows[0];
        const token = generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.full_name,
                createdAt: user.created_at
            },
            token
        };
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (identifier, password) => {
    try {
        const result = await query(
            'SELECT id, email, username, password_hash, full_name, created_at FROM users WHERE email = $1 OR username = $1',
            [identifier]
        );

        if (result.rows.length === 0) {
            throw new Error('Invalid credentials');
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        const token = generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.full_name,
                createdAt: user.created_at
            },
            token
        };
    } catch (error) {
        throw error;
    }
};

export const loginWithGoogle = async (email, fullName, googleId) => {
    try {
        let result = await query(
            'SELECT id, email, username, full_name, created_at FROM users WHERE google_id = $1 OR email = $2',
            [googleId, email]
        );

        let user;

        if (result.rows.length > 0) {
            user = result.rows[0];
            if (!user.google_id) {
                await query(
                    'UPDATE users SET google_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [googleId, user.id]
                );
            }
        } else {
            const username = email.split('@')[0] + '_' + Date.now().toString().slice(-4);
            result = await query(
                'INSERT INTO users (email, username, full_name, google_id) VALUES ($1, $2, $3, $4) RETURNING id, email, username, full_name, created_at',
                [email, username, fullName, googleId]
            );
            user = result.rows[0];
        }

        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        const token = generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.full_name,
                createdAt: user.created_at
            },
            token
        };
    } catch (error) {
        throw error;
    }
};

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        const token = authHeader.replace('Bearer ', '').replace('bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const userResult = await query(
            'SELECT id, email, username, full_name FROM users WHERE id = $1',
            [decoded.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

export const projectAccessMiddleware = async (req, res, next) => {
    try {
        const projectId = req.query.project_id || req.body?.project_id || req.params.project_id || req.params.id;

      //  console.log('projectAccessMiddleware - projectId:', projectId);
      //  console.log('projectAccessMiddleware - req.query:', req.query);
      //  console.log('projectAccessMiddleware - req.body:', req.body);
      // console.log('projectAccessMiddleware - req.params:', req.params);

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const accessResult = await query(
            `SELECT p.id as project_id, p.name as project_name
             FROM project_users pu
             JOIN projects p ON p.id = pu.project_id
             WHERE pu.project_id = $1 AND pu.user_id = $2`,
            [projectId, req.user.id]
        );

        if (accessResult.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied: You do not have permission to access this project' });
        }

        req.project = {
            id: accessResult.rows[0].project_id,
            name: accessResult.rows[0].project_name
        };

        console.log('projectAccessMiddleware - req.project set to:', req.project);

        next();
    } catch (error) {
        console.error('Project access middleware error:', error);
        return res.status(500).json({ error: 'Failed to verify project access' });
    }
};

export const getUserById = async (userId) => {
    try {
        const result = await query(
            'SELECT id, email, username, full_name, created_at, last_login FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.full_name,
            createdAt: user.created_at,
            lastLogin: user.last_login
        };
    } catch (error) {
        throw error;
    }
};
