import https from 'https';
import fs from 'fs';


const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/platform-token/facebook/2',
  method: 'POST',
  key: fs.readFileSync('worker-2.key'),
  cert: fs.readFileSync('worker-2.crt'),
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
}));

req.on('error', (error) => {
  console.error(error);
});

req.end();
