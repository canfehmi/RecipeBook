import { cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const src = path.join(root, 'dist/client/assets');
const dest = path.join(root, 'public/assets');

await rm(dest, { recursive: true, force: true });
await cp(src, dest, { recursive: true });

console.log('assets -> public/assets kopyalandı');