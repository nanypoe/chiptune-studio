/* Servidor local sin dependencias para Chiptune Studio.
   Uso: node tools/serve.js  (PORT=8080 por defecto)
   Sirve la app y genera /demos/index.json y /demos/ al vuelo: cualquier .json nuevo
   en demos/ aparece sin reiniciar. También se puede usar cualquier servidor estático. */
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..'), demosDir = path.join(root, 'demos');
const PORT = +(process.env.PORT || 8080);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.wav': 'audio/wav', '.md': 'text/markdown; charset=utf-8'
};
const send = (res, code, type, body) => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(body); };
const list = () => { try { return fs.readdirSync(demosDir).filter((f) => /\.json$/i.test(f) && f.toLowerCase() !== 'index.json').sort(); } catch (e) { return []; } };
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { return send(res, 400, 'text/plain', '400'); }
  if (p === '/demos/index.json') {
    return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({ demos: list() }));
  }
  if (p === '/demos' || p === '/demos/') {
    const html = '<!doctype html><meta charset="utf-8"><title>Demos · Chiptune Studio</title>' +
      '<h1>Demos</h1><p>Carpeta <code>demos/</code>: cualquier <code>.json</code> aparece aquí automáticamente.</p><ul>' +
      list().map((n) => `<li><a href="/demos/${encodeURIComponent(n)}">${esc(n)}</a></li>`).join('') + '</ul>';
    return send(res, 200, 'text/html; charset=utf-8', html);
  }
  if (p === '/') p = '/index.html';
  const file = path.resolve(root, '.' + p), rel = path.relative(root, file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return send(res, 403, 'text/plain', '403');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'text/plain', '404: ' + p);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Chiptune Studio: http://127.0.0.1:${PORT}/`);
  console.log('Carpeta demos/ en vivo: cualquier .json nuevo aparece en Menú → Demos (se refresca solo).');
});
