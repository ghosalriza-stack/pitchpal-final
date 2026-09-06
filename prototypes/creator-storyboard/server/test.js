import http from 'http';
const server = http.createServer((req, res) => res.end('ok'));
server.listen(3005, () => console.log('listening'));
