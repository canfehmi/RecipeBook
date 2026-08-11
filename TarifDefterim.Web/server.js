import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import compression from 'compression';
import express from 'express';
import sirv from 'sirv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.resolve(__dirname, 'debug.log');
function debugLog(...args) {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${args.join(' ')}\n`);
}

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

const templateHtml = isProduction
  ? fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8')
  : fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function buildHeadTags(meta) {
  let tags = `<title>${escapeHtml(meta.title)}</title>`;
  tags += `<meta name="description" content="${escapeHtml(meta.description)}" />`;
  tags += `<meta property="og:title" content="${escapeHtml(meta.title)}" />`;
  tags += `<meta property="og:description" content="${escapeHtml(meta.description)}" />`;
  if (meta.ogImage) {
    tags += `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`;
  }
  if (meta.structuredData) {
    tags += `<script type="application/ld+json">${JSON.stringify(meta.structuredData).replace(/</g, '\\u003c')}</script>`;
  }
  return tags;
}

function serializeInitialData(dehydratedState) {
  const json = JSON.stringify(dehydratedState).replace(/</g, '\\u003c');
  return `<script>window.__INITIAL_DATA__=${json}</script>`;
}

function renderTemplate(template, { head = '', html = '', initialData = '' } = {}) {
  return template
    .replace('<!--app-head-->', head)
    .replace('<!--app-html-->', html)
    .replace('<!--initial-data-->', initialData);
}

function shouldSSR(url) {
  const pathname = url.split('?')[0];
  return pathname === '/' || pathname === '' || /^\/recipes\/[^/]+$/.test(pathname);
}

const defaultMeta = {
  title: 'Tarif Defterim',
  description: 'Aile tariflerinizi keşfedin, kendi defterinizi oluşturun.',
};

async function handleHtmlRequest(req, res, vite) {
  const url = req.path;
  debugLog('[EXPRESS] HTML isteği, req.path:', url, 'shouldSSR:', shouldSSR(url));

  let template = templateHtml;
  let render;

  if (!isProduction) {
    template = await vite.transformIndexHtml(url, template);
    render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
  } else {
    render = (await import('./dist/server/entry-server.js')).render;
  }

  if (!shouldSSR(url)) {
    const document = renderTemplate(template, { head: buildHeadTags(defaultMeta) });
    res
      .status(200)
      .set({
        'Content-Type': 'text/html; charset=utf-8',
        'X-Rendered-By': 'ssr-server-csr',
      })
      .end(document);
    return;
  }

  const { html, dehydratedState, meta } = await render(url);
  const document = renderTemplate(template, {
    head: buildHeadTags(meta),
    html,
    initialData: serializeInitialData(dehydratedState),
  });

  res
    .status(200)
    .set({
      'Content-Type': 'text/html; charset=utf-8',
      'X-Rendered-By': 'ssr-server',
    })
    .end(document);
}

async function createServer() {
  const app = express();
  app.use(compression());

  const httpServer = http.createServer(app);
  let vite;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      `${base}assets`.replace(/\/+/g, '/'),
      sirv(path.resolve(__dirname, 'dist/client/assets'), { extensions: [] }),
    );
  }

  app.use(async (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    if (req.headers.accept && !req.headers.accept.includes('text/html') && !req.headers.accept.includes('*/*')) {
      return next();
    }

    try {
      await handleHtmlRequest(req, res, vite);
    } catch (error) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(error);
      }
      debugLog('[EXPRESS] HATA:', error?.message ?? error);
      next(error);
    }
  });

  httpServer.listen(port, () => {
    console.log(`SSR server (${isProduction ? 'production' : 'development'}) at http://localhost:${port}`);
  });
}

createServer();
