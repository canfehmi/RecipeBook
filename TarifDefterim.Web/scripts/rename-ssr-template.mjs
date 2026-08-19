import { rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const indexHtml = path.join(root, 'dist/client/index.html');
const templateHtml = path.join(root, 'dist/client/_template.html');

await rename(indexHtml, templateHtml);
console.log('dist/client/index.html -> dist/client/_template.html');
