import https from 'https';
import fs from 'fs';
import express from 'express';
import * as db from './utils/db.js'
import tls from 'tls';

const app = express();
app.use(express.json());

const options = {
  key: fs.readFileSync('vps.key'),
  cert: fs.readFileSync('vps.crt'),
  ca: fs.readFileSync('ca.crt'),
  requestCert: false, //true,
  rejectUnauthorized: false, //true,

  //tls versions
  //minVersion: 'TLSv1.2',
  //maxVersion: 'TLSv1.3'

  minVersion: tls.TLS1_2,
  maxVersion: tls.TLS1_3
};

//worker cert middleware
const requireWorkerCert = (req, res, next) => {
  if (!req.socket.authorized) {
    return res.status(401).json({ error: 'Invalid worker certificate' });
  }
  next();
};

app.post('/api/workers/register', async (req, res) => {
  try {
    console.log('I am through lolololol')
    const { worker_id, worker_name, hostname, capabilities, max_concurrent_tasks } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;

    if (!worker_id) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const existingWorker = await db.query(
      'SELECT * FROM workers WHERE worker_id = $1',
      [worker_id]
    );

    let worker;
    if (existingWorker.rows.length > 0) {
      const result = await db.query(
        `UPDATE workers 
         SET worker_name = $1, hostname = $2, ip_address = $3, 
             capabilities = $4, max_concurrent_tasks = $5,
             status = 'online', last_heartbeat = CURRENT_TIMESTAMP
         WHERE worker_id = $6
         RETURNING *`,
        [worker_name, hostname, ip_address, JSON.stringify(capabilities || {}),
          max_concurrent_tasks || 3, worker_id]
      );
      worker = result.rows[0];
      console.log(`Worker ${worker_id} re-registered`);
    } else {
      const result = await db.query(
        `INSERT INTO workers (worker_id, worker_name, hostname, ip_address, capabilities, max_concurrent_tasks)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [worker_id, worker_name, hostname, ip_address,
          JSON.stringify(capabilities || {}), max_concurrent_tasks || 3]
      );
      worker = result.rows[0];
      console.log(`Worker ${worker_id} registered successfully`);
    }

    res.status(201).json({
      message: 'Worker registered successfully',
      worker: worker
    });
  } catch (error) {
    console.error('Error registering worker:', error);
    res.status(500).json({ error: 'Failed to register worker' });
  }
});

app.post('/api/workers/heartbeat', async (req, res) => {
  try {
    const { worker_id, current_load, cpu_usage, memory_usage, metadata } = req.body;

    if (!worker_id) {
      return res.status(400).json({ error: 'worker_id is required' });
    }

    const result = await db.query(
      `UPDATE workers 
       SET last_heartbeat = CURRENT_TIMESTAMP, 
           status = 'online',
           current_load = $1,
           cpu_usage = $2,
           memory_usage = $3,
           metadata = $4
       WHERE worker_id = $5
       RETURNING *`,
      [current_load || 0, cpu_usage || 0, memory_usage || 0, JSON.stringify(metadata || {}), worker_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found. Please register first.' });
    }

    res.json({
      message: 'Heartbeat received',
      worker: result.rows[0]
    });
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    res.status(500).json({ error: 'Failed to process heartbeat' });
  }
});

https.createServer(options, app).listen(3001, () => {
  console.log('Worker server running on :3001');
});