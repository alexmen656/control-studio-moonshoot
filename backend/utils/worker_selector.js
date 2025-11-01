import db from './db.js';

export async function selectBestWorker(projectId, platformRequirements = [], workerType = 'upload') {
  try {
    const projectResult = await db.query(
      'SELECT preferred_worker_id FROM projects WHERE id = $1',
      [projectId]
    );
    
    const preferredWorkerId = projectResult.rows[0]?.preferred_worker_id;

    await db.query(`
      UPDATE workers 
      SET status = 'offline' 
      WHERE status = 'online' 
        AND last_heartbeat < NOW() - INTERVAL '2 minutes'
    `);

    const workersResult = await db.query(`
      SELECT 
        worker_id,
        worker_name,
        hostname,
        current_load,
        max_concurrent_tasks,
        cpu_usage,
        memory_usage,
        capabilities,
        metadata
      FROM workers 
      WHERE status = 'online'
      ORDER BY last_heartbeat DESC
    `);

    if (workersResult.rows.length === 0) {
      throw new Error('No workers available');
    }

    const workers = workersResult.rows;

    let typeFilteredWorkers = workers;
    if (workerType) {
      typeFilteredWorkers = workers.filter(w => {
        const capabilities = w.capabilities || {};
        const type = capabilities.type;
        
        if (workerType === 'analytics') {
          return type === 'analytics';
        }
        
        return !type || type === workerType;
      });

      if (typeFilteredWorkers.length === 0) {
        throw new Error(`No workers of type '${workerType}' available`);
      }
    }

    if (preferredWorkerId) {
      const preferredWorker = typeFilteredWorkers.find(w => w.worker_id === preferredWorkerId);
      
      if (preferredWorker) {
        if (preferredWorker.current_load < preferredWorker.max_concurrent_tasks) {
          console.log(`✓ Selected preferred worker: ${preferredWorker.worker_name}`);
          return {
            worker_id: preferredWorker.worker_id,
            worker_name: preferredWorker.worker_name,
            reason: 'preferred_worker',
            load: preferredWorker.current_load,
            max_tasks: preferredWorker.max_concurrent_tasks,
            cpu_usage: preferredWorker.cpu_usage,
            memory_usage: preferredWorker.memory_usage
          };
        } else {
          console.log(`⚠ Preferred worker ${preferredWorker.worker_name} is at capacity, selecting alternative...`);
        }
      } else {
        console.log(`⚠ Preferred worker not online, selecting alternative...`);
      }
    }

    const availableWorkers = typeFilteredWorkers.filter(w => 
      w.current_load < w.max_concurrent_tasks
    );

    if (availableWorkers.length === 0) {
      throw new Error('All workers are at capacity');
    }

    let eligibleWorkers = availableWorkers;
    if (platformRequirements.length > 0) {
      eligibleWorkers = availableWorkers.filter(w => {
        const capabilities = w.capabilities || {};
        const supportedPlatforms = capabilities.platforms || [];
        return platformRequirements.every(platform => 
          supportedPlatforms.includes(platform)
        );
      });

      if (eligibleWorkers.length === 0) {
        console.log('⚠ No workers support required platforms, using all available workers');
        eligibleWorkers = availableWorkers;
      }
    }

    const scoredWorkers = eligibleWorkers.map(worker => {
      const loadScore = (worker.current_load / worker.max_concurrent_tasks) * 100;
      const cpuScore = parseFloat(worker.cpu_usage) || 0;
      const memScore = parseFloat(worker.memory_usage) || 0;
      const totalScore = (loadScore * 0.4) + (cpuScore * 0.3) + (memScore * 0.3);

      return {
        ...worker,
        score: totalScore,
        loadScore,
        cpuScore,
        memScore
      };
    });

    scoredWorkers.sort((a, b) => a.score - b.score);

    const selectedWorker = scoredWorkers[0];

    console.log(`✓ Selected worker: ${selectedWorker.worker_name} (Score: ${selectedWorker.score.toFixed(2)})`);
    console.log(`  Load: ${selectedWorker.current_load}/${selectedWorker.max_concurrent_tasks} | CPU: ${selectedWorker.cpu_usage}% | RAM: ${selectedWorker.memory_usage}%`);

    return {
      worker_id: selectedWorker.worker_id,
      worker_name: selectedWorker.worker_name,
      reason: 'best_available',
      load: selectedWorker.current_load,
      max_tasks: selectedWorker.max_concurrent_tasks,
      cpu_usage: selectedWorker.cpu_usage,
      memory_usage: selectedWorker.memory_usage,
      score: selectedWorker.score
    };

  } catch (error) {
    console.error('Error selecting worker:', error);
    throw error;
  }
}

export async function assignJobToWorker(workerId, jobId) {
  try {
    await db.query('BEGIN');

    await db.query(
      `UPDATE worker_jobs 
       SET worker_id = $1, status = 'assigned', started_at = CURRENT_TIMESTAMP
       WHERE job_id = $2`,
      [workerId, jobId]
    );

    await db.query(
      'UPDATE workers SET current_load = current_load + 1 WHERE worker_id = $1',
      [workerId]
    );

    await db.query('COMMIT');
    
    console.log(`✓ Job ${jobId} assigned to worker ${workerId}`);
    return true;
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error assigning job:', error);
    throw error;
  }
}

export async function releaseWorkerFromJob(workerId, jobId, status, errorMessage = null) {
  try {
    await db.query('BEGIN');

    const updateJobQuery = errorMessage
      ? `UPDATE worker_jobs 
         SET status = $1, completed_at = CURRENT_TIMESTAMP, error_message = $2
         WHERE job_id = $3`
      : `UPDATE worker_jobs 
         SET status = $1, completed_at = CURRENT_TIMESTAMP
         WHERE job_id = $2`;

    const params = errorMessage 
      ? [status, errorMessage, jobId]
      : [status, jobId];

    await db.query(updateJobQuery, params);

    await db.query(
      `UPDATE workers 
       SET current_load = GREATEST(current_load - 1, 0) 
       WHERE worker_id = $1`,
      [workerId]
    );

    await db.query('COMMIT');
    
    console.log(`✓ Worker ${workerId} released from job ${jobId} (Status: ${status})`);
    return true;
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error releasing worker:', error);
    throw error;
  }
}

export default {
  selectBestWorker,
  assignJobToWorker,
  releaseWorkerFromJob
};