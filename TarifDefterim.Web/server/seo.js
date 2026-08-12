const SITEMAP_CACHE_TTL_MS = 60 * 60 * 1000;

let sitemapCache = {
  xml: null,
  expiresAt: 0,
};

export function getConfiguredSiteUrl() {
  return (process.env.SITE_URL || 'https://atatarifi.com').replace(/\/$/, '');
}

export function getSiteUrlFromRequest(req) {
  if (process.env.SITE_URL) {
    return getConfiguredSiteUrl();
  }

  const forwardedProto = req.get('x-forwarded-proto');
  const forwardedHost = req.get('x-forwarded-host');
  const protocol = forwardedProto?.split(',')[0]?.trim() || req.protocol;
  const host = forwardedHost?.split(',')[0]?.trim() || req.get('host');

  return `${protocol}://${host}`.replace(/\/$/, '');
}

export function getApiBaseUrl() {
  return (process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'https://api.atatarifi.com').replace(
    /\/$/,
    '',
  );
}

export function toAbsoluteUrl(siteUrl, pathname) {
  if (!pathname) {
    return siteUrl;
  }

  if (/^https?:\/\//i.test(pathname)) {
    return pathname;
  }

  return `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function formatLastMod(value) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString().split('T')[0];
}

export function buildRobotsTxt(siteUrl) {
  return `User-agent: *
Allow: /
Allow: /globalrecipes
Allow: /recipes/

Disallow: /admin
Disallow: /my-recipes
Disallow: /family
Disallow: /account
Disallow: /login
Disallow: /register
Disallow: /confirm-email
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /pending-approvals

Sitemap: ${siteUrl}/sitemap.xml
`;
}

async function fetchGlobalRecipes(apiBaseUrl) {
  const response = await fetch(`${apiBaseUrl}/api/recipes/global`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Global recipes request failed with status ${response.status}`);
  }

  return response.json();
}

export function buildSitemapXml(siteUrl, recipes) {
  const staticEntries = [
    { loc: `${siteUrl}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${siteUrl}/globalrecipes`, changefreq: 'daily', priority: '0.9' },
  ];

  const recipeEntries = recipes.map((recipe) => ({
    loc: `${siteUrl}/recipes/${recipe.id}`,
    lastmod: formatLastMod(recipe.createdAt),
    changefreq: 'monthly',
    priority: '0.8',
  }));

  const entries = [...staticEntries, ...recipeEntries];

  const urlNodes = entries
    .map((entry) => {
      const parts = [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
      ];

      if (entry.lastmod) {
        parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }

      if (entry.changefreq) {
        parts.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
      }

      if (entry.priority) {
        parts.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
      }

      parts.push('  </url>');
      return parts.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>
`;
}

export async function getSitemapXml(siteUrl) {
  const now = Date.now();

  if (sitemapCache.xml && sitemapCache.expiresAt > now) {
    return sitemapCache.xml;
  }

  let recipes = [];

  try {
    recipes = await fetchGlobalRecipes(getApiBaseUrl());
  } catch (error) {
    console.warn('[SEO] Global recipes could not be loaded for sitemap:', error.message);
  }

  const xml = buildSitemapXml(siteUrl, Array.isArray(recipes) ? recipes : []);

  sitemapCache = {
    xml,
    expiresAt: now + SITEMAP_CACHE_TTL_MS,
  };

  return xml;
}
