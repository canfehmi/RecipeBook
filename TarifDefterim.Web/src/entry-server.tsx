import fs from 'node:fs';
import path from 'node:path';

import { QueryClientProvider, dehydrate, type QueryClient } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';

import { AppRoutes } from './App';
import { getCategories } from './api/categories';
import { getGlobalRecipeById, getGlobalRecipes } from './api/recipes';
import type { Recipe } from './api/types';
import { AuthProvider } from './features/auth/AuthContext';
import { createQueryClient } from './queryClient';
import { formatIngredientDisplay } from './utils/formatIngredient';

const logFile = path.resolve(process.cwd(), 'debug.log');
const isProductionEnv = process.env.NODE_ENV === 'production';

function debugLog(...args: unknown[]) {
  if (isProductionEnv || process.env.VERCEL === '1') {
    return;
  }

  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${args.join(' ')}\n`);
}

function getSiteUrl() {
  return (process.env.SITE_URL || 'https://atatarifi.com').replace(/\/$/, '');
}

function toAbsoluteUrl(pathname: string) {
  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return pathname;
  }

  return `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  canonicalPath?: string;
}

const landingMeta: PageMeta = {
  title: 'Ata Tarifi | Ailenizin tarifleri kaybolmasın',
  description:
    'Ata Tarifi ile kendi tarif defterinizi oluşturun, ailenizi davet edin ve yıllardır saklanan tariflerinizi tek bir yerde güvenle biriktirin.',
  canonicalPath: '/',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ata Tarifi',
    description:
      'Ata Tarifi ile kendi tarif defterinizi oluşturun, ailenizi davet edin ve yıllardır saklanan tariflerinizi tek bir yerde güvenle biriktirin.',
    inLanguage: 'tr-TR',
    ...(getSiteUrl() ? { url: getSiteUrl() } : {}),
  },
};

function parseRequestUrl(url: string) {
  return new URL(url, 'http://ssr.local');
}

function buildRecipeFaqSchema(recipe: Recipe) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${recipe.title} kaç kişilik?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${recipe.servings} kişilik.`,
        },
      },
      {
        '@type': 'Question',
        name: `${recipe.title} hazırlama ve pişirme süresi ne kadar?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Hazırlık süresi ${recipe.prepTimeMinutes} dakika, pişirme süresi ${recipe.cookTimeMinutes} dakikadır.`,
        },
      },
      {
        '@type': 'Question',
        name: `${recipe.title} hangi kategoride?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${recipe.categoryName} kategorisindedir.`,
        },
      },
    ],
  };
}

function buildRecipeMeta(recipe: Recipe): PageMeta {
  const description = `${recipe.title} tarifi — ${recipe.categoryName} kategorisinde, hazırlık ${recipe.prepTimeMinutes} dakika, pişirme ${recipe.cookTimeMinutes} dakika.`;
  const recipeUrl = toAbsoluteUrl(`/recipes/${recipe.slug}`);

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: recipe.title,
    description,
    url: recipeUrl,
    image: recipe.coverImageUrl ? [recipe.coverImageUrl] : [],
    author: {
      '@type': 'Person',
      name: recipe.createdByDisplayName,
    },
    recipeCategory: recipe.categoryName,
    prepTime: `PT${recipe.prepTimeMinutes}M`,
    cookTime: `PT${recipe.cookTimeMinutes}M`,
    totalTime: `PT${recipe.prepTimeMinutes + recipe.cookTimeMinutes}M`,
    recipeYield: `${recipe.servings} porsiyon`,
    recipeIngredient: recipe.ingredients
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => formatIngredientDisplay(i.name, i.amount, i.unit)),
    recipeInstructions: recipe.steps
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
  };

  return {
    title: `${recipe.title} | Ata Tarifi`,
    description,
    ogImage: recipe.coverImageUrl ?? undefined,
    canonicalPath: recipeUrl,
    structuredData: [structuredData, buildRecipeFaqSchema(recipe)],
  };
}

async function prefetchRouteData(
  queryClient: QueryClient,
  url: string,
): Promise<PageMeta> {
  debugLog('[SSR] prefetchRouteData url:', JSON.stringify(url));
  const requestUrl = parseRequestUrl(url);
  const pathname = requestUrl.pathname;
  const recipeMatch = pathname.match(/^\/recipes\/([^/]+)$/);
  debugLog('[SSR] recipeMatch sonucu:', recipeMatch);

  if (pathname === '/' || pathname === '' || pathname === '/globalrecipes') {
    const search = requestUrl.searchParams.get('search')?.trim() ?? '';
    const categoryId = requestUrl.searchParams.get('category') ?? '';

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
      }),
      queryClient.prefetchQuery({
        queryKey: ['recipes', 'global', search, categoryId],
        queryFn: () =>
          getGlobalRecipes({
            search: search || undefined,
            categoryId: categoryId || undefined,
          }),
      }),
    ]);

    const canonicalSearch = requestUrl.searchParams.toString();
    return {
      ...landingMeta,
      canonicalPath: toAbsoluteUrl(canonicalSearch ? `/?${canonicalSearch}` : '/'),
    };
  }

  if (recipeMatch) {
    const idOrSlug = recipeMatch[1];
    try {
      const recipe = await queryClient.fetchQuery({
        queryKey: ['recipes', 'global', idOrSlug],
        queryFn: () => getGlobalRecipeById(idOrSlug),
      });
      return buildRecipeMeta(recipe);
    } catch {
      return {
        title: 'Tarif Bulunamadı | Ata Tarifi',
        description: 'Aradığınız tarif bulunamadı.',
        canonicalPath: toAbsoluteUrl(pathname),
      };
    }
  }

  return landingMeta;
}

export async function render(
  url: string,
  initialDataFetcher?: (queryClient: QueryClient, url: string) => Promise<PageMeta>,
) {
  debugLog('[SSR] render() çağrıldı, url:', JSON.stringify(url));
  const queryClient = createQueryClient();

  const meta = initialDataFetcher
    ? await initialDataFetcher(queryClient, url)
    : await prefetchRouteData(queryClient, url);

  const html = renderToString(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );

  const dehydratedState = dehydrate(queryClient);

  return { html, dehydratedState, meta };
}
