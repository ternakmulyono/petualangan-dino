/* dino-adventure-reading - server.js */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
    // Strip query parameters
    const urlPath = req.url.split('?')[0];
    let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
    
    // Prevent directory traversal attacks
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Akses ditolak');
        return;
    }

    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Tidak Ditemukan</h1><p>Pastikan file yang dicari ada di folder proyek.</p>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Maaf, terjadi kesalahan internal: ${error.code}\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`=== Dino Adventure Reading MVP Server ===`);
    console.log(`Buka browser Anda dan kunjungi:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`========================================`);
});
