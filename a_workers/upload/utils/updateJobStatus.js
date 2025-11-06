import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';
import fs from 'fs';

dotenv.config();

export async function updateJobStatus(jobId, status, errorMessage = null, resultData = null) {
    try {
        const backendUrl = process.env.BACKEND_URL || 'https://localhost:3001';
        const workerId = process.env.WORKER_ID || `worker-${uuidv4()}`;

        const httpsAgent = new https.Agent({
            cert: fs.readFileSync(`certs/worker-${workerId}.crt`),
            key: fs.readFileSync(`certs/worker-${workerId}.key`),
            ca: fs.readFileSync('certs/ca.crt'),
            minVersion: 'TLSv1.2',
            maxVersion: 'TLSv1.3'
        });

        await axios.patch(`${backendUrl}/api/jobs/${jobId}/status`, {
            status,
            error_message: errorMessage,
            result_data: resultData
        }, { httpsAgent: httpsAgent });

        console.log(`✓ Job ${jobId} status updated: ${status}`);
    } catch (error) {
        console.error(`Failed to update job status:`, error.message);
    }
}

