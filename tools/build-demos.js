/* Regenera demos/index.json y demos/demos.js a partir de demos/*.json.
   Uso: node tools/build-demos.js [--watch]
   - index.json: manifiesto para servidores estáticos sin listado de carpeta.
   - demos.js: copia inline para que las demos funcionen abriendo index.html con doble clic (file://). */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'demos');
const read = () => fs.readdirSync(dir).filter((f) => /\.json$/i.test(f) && f.toLowerCase() !== 'index.json').sort();

function build() {
  const files = read(), names = [], builtin = [];
  for (const file of files) {
    try {
      const song = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (!song || !Array.isArray(song.tracks) || !song.tracks.length) throw new Error('no tiene "tracks"');
      names.push(file);
      builtin.push({ file, name: song.title || file, song });
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
    }
  }
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ demos: names }, null, 1) + '\n');
  fs.writeFileSync(path.join(dir, 'demos.js'),
    '/* Generado por tools/build-demos.js. No editar a mano: añade .json a demos/ y vuelve a ejecutarlo. */\n' +
    'window.CS_DEMOS_BUILTIN = ' + JSON.stringify(builtin) + ';\n');
  const kb = (fs.statSync(path.join(dir, 'demos.js')).size / 1024).toFixed(0);
  console.log(`✓ ${names.length} demo(s) · index.json + demos.js (${kb} KB)`);
  names.forEach((n) => console.log('  · ' + n));
}

build();
if (process.argv.includes('--watch')) {
  let timer;
  fs.watch(dir, (event, file) => {
    if (!file || !/\.json$/i.test(file) || file.toLowerCase() === 'index.json') return;
    clearTimeout(timer);
    timer = setTimeout(build, 250);
  });
  console.log('👀 Vigilando demos/*.json (Ctrl+C para salir). Recarga la app para ver los cambios en modo doble clic.');
}
