/**
 * copy-vendor.js
 *
 * After `npm install`, this script copies the compiled library files we need
 * (AngularJS core + modules, Bootstrap CSS/JS, Bootstrap Icons) out of
 * node_modules and into src/vendor/. This keeps the runtime app fully
 * self-contained - useful when the frontend is packaged into a Docker image
 * and served by Nginx with no internet access and no CDN dependency.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VENDOR_DIR = path.join(ROOT, 'src', 'vendor');

const filesToCopy = [
  { from: 'node_modules/angular/angular.min.js', to: 'vendor/angular.min.js' },
  { from: 'node_modules/angular-route/angular-route.min.js', to: 'vendor/angular-route.min.js' },
  { from: 'node_modules/angular-resource/angular-resource.min.js', to: 'vendor/angular-resource.min.js' },
  { from: 'node_modules/bootstrap/dist/css/bootstrap.min.css', to: 'vendor/bootstrap.min.css' },
  { from: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', to: 'vendor/bootstrap.bundle.min.js' },
  { from: 'node_modules/bootstrap-icons/font/bootstrap-icons.min.css', to: 'vendor/bootstrap-icons.min.css' },
];

const dirsToCopy = [
  { from: 'node_modules/bootstrap-icons/font/fonts', to: 'vendor/fonts' },
];

function copyFile(from, to) {
  const src = path.join(ROOT, from);
  const dest = path.join(ROOT, 'src', to);
  if (!fs.existsSync(src)) {
    console.warn(`[copy-vendor] Skipping missing file: ${from}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`[copy-vendor] Copied ${from} -> src/${to}`);
}

function copyDir(from, to) {
  const src = path.join(ROOT, from);
  const dest = path.join(ROOT, 'src', to);
  if (!fs.existsSync(src)) {
    console.warn(`[copy-vendor] Skipping missing dir: ${from}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    fs.copyFileSync(path.join(src, entry), path.join(dest, entry));
  }
  console.log(`[copy-vendor] Copied dir ${from} -> src/${to}`);
}

fs.mkdirSync(VENDOR_DIR, { recursive: true });
filesToCopy.forEach((f) => copyFile(f.from, f.to));
dirsToCopy.forEach((d) => copyDir(d.from, d.to));

console.log('[copy-vendor] Done.');
