const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BACKEND_PORT = 5000;

const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
    let reqUrl = req.url;
    let reqPath = reqUrl.split('?')[0];

    // Proxy backend API and receipt routes to backend server on port 5000
    if (reqPath.startsWith('/bookings') || reqPath.startsWith('/api') || reqPath.startsWith('/vehicles') || reqPath.startsWith('/customers') || reqPath.startsWith('/owners') || reqPath.startsWith('/categories') || reqPath.startsWith('/branches') || reqPath.startsWith('/maintenance') || reqPath.startsWith('/admins') || reqPath.startsWith('/contact')) {
        const proxyReq = http.request({
            hostname: '127.0.0.1',
            port: BACKEND_PORT,
            path: reqUrl,
            method: req.method,
            headers: req.headers
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (err) => {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Backend proxy error: ' + err.message);
        });

        req.pipe(proxyReq, { end: true });
        return;
    }

    // Serve static frontend files
    let filePath = path.join(__dirname, reqPath === '/' ? 'index.html' : reqPath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
        }
        let ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
        res.end(data);
    });
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend web server running on http://localhost:${PORT} (proxying API to port ${BACKEND_PORT})`);
});


