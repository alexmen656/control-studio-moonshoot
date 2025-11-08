import https from 'https';
import fs from 'fs';


import tls from 'tls';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/workers/register',
  method: 'POST',
  key: fs.readFileSync('worker-1.key'),
  cert: fs.readFileSync('worker-1.crt'),
  ca: fs.readFileSync('ca.crt'),
  headers: { 'Content-Type': 'application/json' },

  //tls versions
  //  minVersion: tls.TLS1_2,
 // maxVersion: tls.TLS1_3, 

   minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', d => console.log(d.toString()));
});

req.write(JSON.stringify({
  worker_id: 'worker-1',
  worker_name: 'Analytics Worker',
  capabilities: ['analytics'],
  max_concurrent_tasks: 5
}));
req.end();
