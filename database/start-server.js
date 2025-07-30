const { exec } = require('child_process');
const path = require('path');

console.log('Starting JSON Server...');

// Start json-server with the db.json file
const server = exec('json-server db.json --port 3000 --host 0.0.0.0', {
  cwd: __dirname
});

server.stdout.on('data', (data) => {
  console.log(data);
});

server.stderr.on('data', (data) => {
  console.error(data);
});

server.on('close', (code) => {
  console.log(`JSON Server exited with code ${code}`);
});

console.log('JSON Server should be starting on http://localhost:3000');