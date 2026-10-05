const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
};

const server = http.createServer((req, res) => {
  const [rawPath, query = ''] = req.url.split('?');
  let reqPath = decodeURIComponent(rawPath);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
    };

    // 미디어 파일은 브라우저 캐시 (재방문/재생 시 재다운로드 방지)
    if (ext === '.mp3') headers['Cache-Control'] = 'public, max-age=86400';

    // ?download=1 → 브라우저에서 재생하지 않고 파일로 저장
    if (new URLSearchParams(query).has('download')) {
      headers['Content-Disposition'] = `attachment; filename="${path.basename(filePath)}"`;
    }

    // Range 요청 지원 (iOS Safari 오디오 재생에 필요)
    const range = req.headers.range;
    const match = range && /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match && (match[1] || match[2])) {
      let start = match[1] ? parseInt(match[1], 10) : stats.size - parseInt(match[2], 10);
      let end = match[1] && match[2] ? parseInt(match[2], 10) : stats.size - 1;
      start = Math.max(0, start);
      end = Math.min(end, stats.size - 1);
      if (start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        return res.end();
      }
      headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
      headers['Content-Length'] = end - start + 1;
      res.writeHead(206, headers);
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }

    headers['Content-Length'] = stats.size;
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
