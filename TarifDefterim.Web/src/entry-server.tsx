import fs from 'node:fs';
import path from 'node:path';

import { QueryClientProvider, dehydrate, type QueryClient } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';

import { AppRoutes } from './App';
import { getGlobalRecipeById, getGlobalRecipes } from './api/recipes';
import type { Recipe } from './api/types';
import { AuthProvider } from './features/auth/AuthContext';
import { createQueryClient } from './queryClient';

const logFile = path.resolve(process.cwd(), 'debug.log');
function debugLog(...args: unknown[]) {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${args.join(' ')}\n`);
}

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}

const defaultMeta: PageMeta = {
  title: 'Tarif Defterim',
  description: 'Aile tariflerinizi keşfedin, kendi defterinizi oluşturun.',
};

function buildRecipeMeta(recipe: Recipe): PageMeta {
  const description = `${recipe.title} tarifi — ${recipe.categoryName} kategorisinde, hazırlık ${recipe.prepTimeMinutes} dakika, pişirme ${recipe.cookTimeMinutes} dakika.`;

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: recipe.title,
    description,
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
      .map((i) => `${i.amount} ${i.unit} ${i.name}`),
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
    title: `${recipe.title} | Tarif Defterim`,
    description,
    ogImage: recipe.coverImageUrl ?? undefined,
    structuredData,
  };
}

async function prefetchRouteData(
  queryClient: QueryClient,
  url: string,
): Promise<PageMeta> {
  debugLog('[SSR] prefetchRouteData url:', JSON.stringify(url));
  const recipeMatch = url.match(/^\/recipes\/([^/]+)$/);
  debugLog('[SSR] recipeMatch sonucu:', recipeMatch);

  if (url === '/' || url === '') {
    await queryClient.prefetchQuery({
      queryKey: ['recipes', 'global', '', ''],
      queryFn: () => getGlobalRecipes(),
    });
    return defaultMeta;
  }

  if (recipeMatch) {
    const id = recipeMatch[1];
    try {
      const recipe = await queryClient.fetchQuery({
        queryKey: ['recipes', 'global', id],
        queryFn: () => getGlobalRecipeById(id),
      });
      return buildRecipeMeta(recipe);
    } catch {
      return {
        title: 'Tarif Bulunamadı | Tarif Defterim',
        description: 'Aradığınız tarif bulunamadı.',
      };
    }
  }

  return defaultMeta;
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
