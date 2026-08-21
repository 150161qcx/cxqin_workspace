import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error(`pagefind: dist 目录不存在（${dist}），请先运行 astro build`);
  process.exit(1);
}

// Windows 下 npm 的 shim 是 npx.cmd，需显式扩展名；用命令字符串形式避免 DEP0190 警告
const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

execSync(`${npxBin} pagefind --site "${dist}"`, { stdio: 'inherit' });
