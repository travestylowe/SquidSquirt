/**
 * Syntax-check all project .js files (ESM-friendly). Run: npm run check
 */
import { readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function collectJs(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules') continue;
      await collectJs(p, out);
    } else if (e.isFile() && e.name.endsWith('.js')) {
      out.push(p);
    }
  }
  return out;
}

const files = [
  join(root, 'config.js'),
  join(root, 'config.example.js'),
  ...(await collectJs(join(root, 'js'))),
];

let failed = false;
for (const f of files) {
  try {
    await stat(f);
  } catch {
    continue;
  }
  const r = spawnSync(process.execPath, ['--check', f], {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  if (r.status !== 0) {
    failed = true;
    console.error(r.stderr || r.stdout || `check failed: ${f}`);
  }
}

if (failed) process.exit(1);
console.log(`OK: ${files.length} file(s) checked.`);
