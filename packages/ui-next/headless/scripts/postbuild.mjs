// 构建后处理：把 tsdown 生成的 d.ts（dist-dts）合并进 vite 的 js 产物目录（dist）。
// 只拷贝 .d.ts，避免 tsdown 的 js（无运行时 props 声明）覆盖 vite 的 js。
import fs from 'node:fs';
import path from 'node:path';

function copyDtsOnly(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDtsOnly(srcPath, destPath);
    } else if (entry.name.endsWith('.d.ts')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcDir = 'dist-dts';
const distDir = 'dist';
if (fs.existsSync(srcDir)) {
  copyDtsOnly(srcDir, distDir);
  fs.rmSync(srcDir, { recursive: true });
  console.log('[postbuild] d.ts merged into dist');
}
