// Build pipeline: esbuild bundles the React/TypeScript app, Tailwind v4 compiles the CSS.
// Output is a fully static site in /dist (deployable to Vercel, Netlify or GitHub Pages).
//
//   npm run build     one-off production build
//   npm run dev       rebuild on change + local server on http://localhost:5173
//   npm run preview   serve the existing /dist build
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'package.json'));
const esbuild = require('esbuild');
const tailwind = require('tailwindcss');

const args = new Set(process.argv.slice(2));
const watch = args.has('--watch');
const serveOnly = args.has('--serve');
const dist = path.join(root, 'dist');
const src = path.join(root, 'src');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(tsx?|html)$/.test(entry.name)) out.push(p);
  }
  return out;
}

// Tailwind v4 normally scans with its native "oxide" scanner. We extract
// candidate class tokens ourselves so the build has no native dependencies.
function candidates() {
  const set = new Set();
  const files = [...walk(src), path.join(root, 'index.html')];
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(/[^\s"'`{}()<>;,]+/g)) {
      const t = m[0].replace(/^[.:]+/, '');
      if (t.length < 60 && /[a-z]/.test(t)) set.add(t);
    }
  }
  return [...set];
}

async function buildCss() {
  const twBase = path.dirname(require.resolve('tailwindcss/package.json'));
  const input = fs.readFileSync(path.join(src, 'styles.css'), 'utf8');
  const compiler = await tailwind.compile(input, {
    base: src,
    loadStylesheet: async (id, base) => {
      const file = id === 'tailwindcss' ? path.join(twBase, 'index.css') : path.resolve(base, id);
      return { path: file, base: path.dirname(file), content: fs.readFileSync(file, 'utf8') };
    },
  });
  const css = compiler.build(candidates());
  const { code } = await esbuild.transform(css, { loader: 'css', minify: !watch });
  fs.writeFileSync(path.join(dist, 'app.css'), code);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

async function buildAll() {
  const t = Date.now();
  fs.mkdirSync(dist, { recursive: true });
  copyDir(path.join(root, 'public'), dist);
  fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
  await esbuild.build({
    entryPoints: [path.join(src, 'main.tsx')],
    bundle: true,
    outfile: path.join(dist, 'app.js'),
    format: 'esm',
    jsx: 'automatic',
    target: ['es2020', 'safari15'],
    minify: !watch,
    sourcemap: watch,
    define: { 'process.env.NODE_ENV': JSON.stringify(watch ? 'development' : 'production') },
    logLevel: 'warning',
  });
  await buildCss();
  console.log(`built in ${Date.now() - t}ms`);
}

function serve(port = 5173) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.map': 'application/json' };
  http.createServer((req, res) => {
    let p = path.join(dist, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(dist) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(dist, 'index.html');
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(p).pipe(res);
  }).listen(port, () => console.log(`serving dist on http://localhost:${port}`));
}

if (serveOnly) {
  serve();
} else {
  await buildAll();
  if (watch) {
    let timer;
    fs.watch(root, { recursive: true }, (_e, file) => {
      if (!file || file.startsWith('dist') || file.startsWith('node_modules') || file.startsWith('.git')) return;
      clearTimeout(timer);
      timer = setTimeout(() => buildAll().catch((e) => console.error(e.message)), 80);
    });
    serve();
  }
}
