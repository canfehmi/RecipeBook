import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import compression from 'compression';
import express from 'express';
import sirv from 'sirv';

import {
  buildRobotsTxt,
  fetchRecipeByIdOrSlug,
  getConfiguredSiteUrl,
  getSitemapXml,
  getSiteUrlFromRequest,
  isGuid,
  toAbsoluteUrl,
} from './server/seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.resolve(__dirname, 'debug.log');
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

function debugLog(...args) {
  if (isProduction) {
    return;
  }

  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${args.join(' ')}\n`);
}

const templateHtml = isProduction
  ? fs.readFileSync(path.resolve(__dirname, 'dist/client/_template.html'), 'utf-8')
  : fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function buildHeadTags(meta) {
  const siteUrl = getConfiguredSiteUrl();
  let tags = `<title>${escapeHtml(meta.title)}</title>`;
  tags += `<meta name="description" content="${escapeHtml(meta.description)}" />`;
  tags += `<meta property="og:title" content="${escapeHtml(meta.title)}" />`;
  tags += `<meta property="og:description" content="${escapeHtml(meta.description)}" />`;
  tags += `<meta property="og:type" content="website" />`;
  tags += `<meta property="og:locale" content="tr_TR" />`;
  if (meta.canonicalPath) {
    const canonicalUrl = toAbsoluteUrl(siteUrl, meta.canonicalPath);
    tags += `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
    tags += `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`;
  }
  if (meta.ogImage) {
    tags += `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`;
  }
  const structuredDataBlocks = Array.isArray(meta.structuredData)
    ? meta.structuredData
    : meta.structuredData
      ? [meta.structuredData]
      : [];

  for (const block of structuredDataBlocks) {
    tags += `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`;
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
  return (
    pathname === '/' ||
    pathname === '' ||
    pathname === '/globalrecipes' ||
    /^\/recipes\/[^/]+$/.test(pathname)
  );
}

function isStaticAssetPath(pathname) {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

const defaultMeta = {
  title: 'Ata Tarifi | Ailenizin tarifleri kaybolmasın',
  description:
    'Ata Tarifi ile kendi tarif defterinizi oluşturun, ailenizi davet edin ve yıllardır saklanan tariflerinizi tek bir yerde güvenle biriktirin.',
  canonicalPath: '/',
};

async function handleHtmlRequest(req, res, vite) {
  const url = req.originalUrl.split('#')[0];
  debugLog('[EXPRESS] HTML isteği, url:', url, 'shouldSSR:', shouldSSR(url));

  const pathname = url.split('?')[0];
  const recipeMatch = pathname.match(/^\/recipes\/([^/]+)$/);
  if (recipeMatch) {
    const param = decodeURIComponent(recipeMatch[1]);
    if (isGuid(param)) {
      try {
        const recipe = await fetchRecipeByIdOrSlug(param);
        if (recipe?.slug && recipe.slug !== param) {
          const query = url.includes('?') ? url.slice(url.indexOf('?')) : '';
          res.redirect(301, `/recipes/${encodeURIComponent(recipe.slug)}${query}`);
          return;
        }
      } catch (error) {
        debugLog('[EXPRESS] GUID slug redirect lookup failed:', error?.message ?? error);
      }
    }
  }

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

async function createApp(httpServer) {
  const app = express();
  app.use(compression());

  app.get('/robots.txt', (req, res) => {
    const siteUrl = getSiteUrlFromRequest(req);
    res
      .type('text/plain')
      .set('Cache-Control', 'public, max-age=86400')
      .send(buildRobotsTxt(siteUrl));
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const siteUrl = getSiteUrlFromRequest(req);
      const xml = await getSitemapXml(siteUrl);
      res
        .type('application/xml')
        .set('Cache-Control', 'public, max-age=3600')
        .send(xml);
    } catch (error) {
      console.error('[SEO] sitemap.xml generation failed:', error);
      res.status(500).type('text/plain').send('Sitemap could not be generated.');
    }
  });

  let vite;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      server: {
        middlewareMode: true,
        hmr: httpServer ? { server: httpServer } : undefined,
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const clientRoot = path.resolve(__dirname, 'dist/client');
    const serveClientStatic = sirv(clientRoot, {
      // Sirv has no `index: false`; empty extensions disable / -> /index.html resolution.
      extensions: [],
      single: false,
    });

    app.use((req, res, next) => {
      const pathname = req.path.split('?')[0];
      if (pathname === '/' || pathname === '/index.html' || pathname === '/index.htm') {
        return next();
      }

      serveClientStatic(req, res, next);
    });
  }

  app.use(async (req, res, next) => {
    const pathname = req.path.split('?')[0];

    if (isStaticAssetPath(pathname)) {
      return next();
    }

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

  app.use((req, res, next) => {
    if (isStaticAssetPath(req.path.split('?')[0])) {
      res.status(404).end();
      return;
    }

    next();
  });

  return app;
}

let app;

if (isVercel) {
  app = await createApp();
} else {
  const httpServer = http.createServer();
  app = await createApp(httpServer);
  httpServer.on('request', app);
  httpServer.listen(port, () => {
    console.log(`SSR server (${isProduction ? 'production' : 'development'}) at http://localhost:${port}`);
  });
}

export default app;
