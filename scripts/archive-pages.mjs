// Keep the previous design independent, including links on project GitHub Pages.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const base = '/kontur-classic';
const origin = 'https://dimanexojin-collab.github.io';
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) { await visit(file); continue; }
    if (!/\.(html|css|js|xml|txt|webmanifest)$/.test(file)) continue;
    let s = await readFile(file, 'utf8');
    s = s.replaceAll(origin, origin + base);
    if (file.endsWith('.html')) {
      s = s.replace(/\b(href|src|action|poster)=(['"])\/(?!\/)/g, `$1=$2${base}/`);
      s = s.replace(/\bsrcset=(['"])(.*?)\1/g, (_, q, list) => `srcset=${q}${list.replace(/(^|,\s*)\/(?!\/)/g, `$1${base}/`)}${q}`);
    }
    s = s.replace(/url\((['"]?)\/(?!\/)/g, `url($1${base}/`);
    if (file.endsWith('.js')) s = s.replace(/(['"])\/_astro\//g, `$1${base}/_astro/`);
    if (file.endsWith('.webmanifest')) s = s.replace(/"\/(?!\/)/g, `"${base}/`);
    await writeFile(file, s);
  }
}
await visit('dist');
console.log('Classic site prepared for ' + base);
