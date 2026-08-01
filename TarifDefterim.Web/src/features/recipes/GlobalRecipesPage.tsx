import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../api/categories';
import { getGlobalRecipes } from '../../api/recipes';
import { useAuth } from '../auth/AuthContext';

export function GlobalRecipesPage() {
  const { isAuthenticated } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasActiveFilter = debouncedSearch.length > 0 || categoryId.length > 0;

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: recipes, isLoading, isError } = useQuery({
    queryKey: ['recipes', 'global', debouncedSearch, categoryId],
    queryFn: () =>
      getGlobalRecipes({
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
      }),
  });

  return (
    <div>
      {!isAuthenticated && (
        <div className="mb-8 rounded-2xl border border-border bg-card px-6 py-8 text-center">
          <h1 className="font-heading text-3xl font-semibold text-ink">
            Tarif Defterim&apos;e Hoş Geldiniz
          </h1>
          <p className="mt-2 text-muted">
            Aile tariflerinizi keşfedin, kendi defterinizi oluşturun.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-primary">
              Kayıt Ol
            </Link>
            <Link to="/login" className="btn-secondary">
              Giriş Yap
            </Link>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <h1 className="mb-8 font-heading text-3xl font-semibold text-ink">Global Tarifler</h1>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Tarif ara..."
          className="input-field flex-1"
          aria-label="Tarif ara"
        />
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          disabled={categoriesLoading}
          className="input-field disabled:bg-cream sm:w-56"
          aria-label="Kategori filtresi"
        >
          <option value="">Tüm Kategoriler</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-muted">Yükleniyor...</p>}

      {isError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Tarifler yüklenirken bir hata oluştu.
        </p>
      )}

      {!isLoading && !isError && (recipes ?? []).length === 0 && (
        <div className="card flex flex-col items-center justify-center border-dashed py-16">
          <p className="text-muted">
            {hasActiveFilter
              ? 'Aramanızla eşleşen tarif yok'
              : 'Henüz global tarif eklenmedi'}
          </p>
        </div>
      )}

      {!isLoading && !isError && (recipes ?? []).length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(recipes ?? []).map((recipe) => (
            <Link
              key={recipe.id}
              to={`/recipes/${recipe.id}`}
              className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {recipe.coverImageUrl ? (
                <img
                  src={recipe.coverImageUrl}
                  alt={recipe.title}
                  className="h-44 w-full rounded-t-2xl object-cover"
                />
              ) : (
                <div className="flex h-44 w-full items-center justify-center rounded-t-2xl bg-cream text-sm text-muted">
                  Görsel yok
                </div>
              )}

              <div className="p-5">
                <h2 className="mb-2 font-heading text-lg font-semibold text-ink">{recipe.title}</h2>
                <p className="text-sm text-muted">{recipe.categoryName}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
