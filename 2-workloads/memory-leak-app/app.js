const http = require('http');

const leak = [];
http.createServer((req, res) => {
  // Add ~1MB of strings to the array on each request to simulate a leak
  leak.push(Buffer.alloc(1024 * 1024, 'x'));
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Leaking memory... Current size: ${leak.length} MB\n`);
}).listen(8080);
console.log('Memory leak server running on port 8080');