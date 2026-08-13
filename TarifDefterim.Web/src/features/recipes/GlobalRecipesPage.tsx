import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCategories } from '../../api/categories';
import { getGlobalRecipes } from '../../api/recipes';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../auth/AuthContext';

const PAGE_SIZE = 9;

const familyTree = `              ATA TARİFİ

            👨 Baba
          Aile Büyüğü
                │
       ┌────────┴────────┐
       │                 │
    👩 Anne            👦 Çocuk
  Aile Büyüğü            Üye
       │                 │
       └────────┬────────┘
                ↓
        📖 Aile Tarif Defteri`;

function parsePage(value: string | null): number {
  const parsed = Number(value ?? '1');
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function GuestHero() {
  return (
    <>
      <header className="relative -mx-4 mb-10 overflow-hidden border-b border-border bg-gradient-to-br from-card via-cream to-secondary-bg px-4 sm:-mx-0 sm:rounded-2xl sm:border">
        <div className="grid gap-10 py-10 lg:grid-cols-2 lg:items-center lg:py-14">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-secondary-bg px-3 py-1 text-xs font-medium text-secondary-text">
              Aile tarifleriniz için
            </p>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Ailenizin tarifleri kaybolmasın.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Ata Tarifi ile kendi tarif defterinizi oluşturun, ailenizi davet edin ve yıllardır
              saklanan tariflerinizi tek bir yerde güvenle biriktirin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-6 py-2.5">
                Ücretsiz Başla
              </Link>
              <a href="#global-recipes-list" className="btn-secondary px-6 py-2.5">
                Tarifleri Keşfet
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
            <div className="card overflow-hidden shadow-md">
              <div className="bg-gradient-to-br from-accent/15 via-cream to-secondary-bg px-6 py-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-2xl text-white">
                    📖
                  </div>
                  <div>
                    <p className="font-heading text-lg font-semibold text-ink">Ata Tarifi</p>
                    <p className="text-sm text-muted">Aile tarif defteri</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["Anneanne'nin çorbası", 'Babaanne keki', 'Pazar pilavı'].map((title) => (
                    <div
                      key={title}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                    >
                      <span className="text-lg">🍲</span>
                      <span className="text-sm font-medium text-ink">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4 text-sm text-muted">
                <span>👨‍👩‍👧‍👦 4 aile üyesi</span>
                <span>🔒 Özel</span>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-full bg-secondary/20 blur-2xl sm:block" />
            <div className="absolute -bottom-6 -left-6 hidden h-32 w-32 rounded-full bg-accent/10 blur-3xl sm:block" />
          </div>
        </div>
      </header>

      <section className="mb-10" aria-labelledby="why-ata-tarifi">
        <h2 id="why-ata-tarifi" className="font-heading text-3xl font-semibold text-ink">
          Neden Ata Tarifi?
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 text-lg leading-relaxed text-muted">
          <p>İnternette bir tarifi bulmak kolay.</p>
          <p>Aylar sonra aynı tarifi tekrar bulmak ise o kadar kolay değil.</p>
          <p>
            Ekran görüntüleri, WhatsApp mesajları, telefon notları, farklı internet siteleri...
          </p>
          <p className="font-medium text-ink">
            Ata Tarifi bunların yerine size ait bir tarif defteri oluşturur.
          </p>
        </div>
      </section>

      <section
        className="-mx-4 mb-10 border-y border-border bg-card px-4 py-10 sm:-mx-0 sm:rounded-2xl sm:border sm:py-12"
        aria-labelledby="family-recipe-book"
      >
        <h2 id="family-recipe-book" className="font-heading text-3xl font-semibold text-ink">
          Ailenizin ortak tarif defteri
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
          Ailenizi oluşturun, aile üyelerinizi davet edin ve tariflerinizi birlikte biriktirin.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0 max-w-full overflow-x-auto">
            <pre className="rounded-2xl border border-border bg-cream p-4 text-center font-mono text-[0.65rem] leading-relaxed text-ink sm:p-6 sm:text-sm">
              {familyTree}
            </pre>
          </div>

          <ul className="space-y-4 text-base leading-relaxed text-muted">
            <li className="flex gap-3">
              <span aria-hidden="true">🔒</span>
              <span>Tariflerinizi sadece aile üyeleriniz görebilir.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true">👨‍👩‍👧‍👦</span>
              <span>Aile üyeleri tarif ekleyebilir.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true">✅</span>
              <span>Aile büyükleri tarifleri onaylar.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="global-recipes-intro">
        <h2 id="global-recipes-intro" className="font-heading text-3xl font-semibold text-ink">
          Aradığınız tarif zaten Ata Tarifi&apos;nde olabilir.
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-lg leading-relaxed text-muted">
          <p className="font-medium text-ink">Global tarifler herkese açık.</p>
          <p>
            Global tarifleri herkes görebilir, ancak yalnızca kendi tarif defterinize
            kopyalayabilirsiniz. Global tariflerin kendisini değiştiremez veya silemezsiniz.
          </p>
        </div>
      </section>
    </>
  );
}

function GuestCta() {
  return (
    <section
      className="-mx-4 mt-12 border-t border-border bg-gradient-to-br from-accent/10 via-cream to-secondary-bg px-4 py-12 text-center sm:-mx-0 sm:rounded-2xl sm:border"
      aria-labelledby="guest-cta"
    >
      <h2 id="guest-cta" className="font-heading text-3xl font-semibold text-ink">
        Tariflerinizi bugün biriktirmeye başlayın.
      </h2>
      <Link to="/register" className="btn-primary mt-8 inline-flex px-8 py-3 text-base">
        Ata Tarifi&apos;ni Ücretsiz Kullan
      </Link>
    </section>
  );
}

export function GlobalRecipesPage() {
  const { isAuthenticated, isAuthReady } = useAuth();
  const showGuestContent = isAuthReady && !isAuthenticated;

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');

  const search = searchParams.get('search')?.trim() ?? '';
  const categoryId = searchParams.get('category') ?? '';
  const currentPage = parsePage(searchParams.get('page'));

  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = searchInput.trim();
      const currentSearch = searchParams.get('search')?.trim() ?? '';

      if (nextSearch === currentSearch) {
        return;
      }

      const nextParams = new URLSearchParams(searchParams);
      if (nextSearch) {
        nextParams.set('search', nextSearch);
      } else {
        nextParams.delete('search');
      }
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  const hasActiveFilter = search.length > 0 || categoryId.length > 0;

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: recipes, isLoading, isError } = useQuery({
    queryKey: ['recipes', 'global', search, categoryId],
    queryFn: () =>
      getGlobalRecipes({
        search: search || undefined,
        categoryId: categoryId || undefined,
      }),
  });

  const totalPages = Math.max(1, Math.ceil((recipes?.length ?? 0) / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecipes = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return (recipes ?? []).slice(start, start + PAGE_SIZE);
  }, [recipes, safePage]);

  useEffect(() => {
    if (currentPage !== safePage) {
      const nextParams = new URLSearchParams(searchParams);
      if (safePage <= 1) {
        nextParams.delete('page');
      } else {
        nextParams.set('page', String(safePage));
      }
      setSearchParams(nextParams, { replace: true });
    }
  }, [currentPage, safePage, searchParams, setSearchParams]);

  function updateCategory(nextCategoryId: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (nextCategoryId) {
      nextParams.set('category', nextCategoryId);
    } else {
      nextParams.delete('category');
    }
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  }

  function buildPageUrl(page: number) {
    const nextParams = new URLSearchParams(searchParams);
    if (page <= 1) {
      nextParams.delete('page');
    } else {
      nextParams.set('page', String(page));
    }
    const query = nextParams.toString();
    return query ? `/?${query}` : '/';
  }

  return (
    <div>
      {showGuestContent && <GuestHero />}

      <header id="global-recipes-list" className="mb-8 scroll-mt-24">
        {!showGuestContent && (
          <>
            <h1 className="font-heading text-3xl font-semibold text-ink">Global Tarifler</h1>
            <p className="mt-2 max-w-2xl text-muted">
              Herkese açık tarifleri keşfedin. Beğendiğiniz tarifleri kendi defterinize
              kopyalayabilirsiniz.
            </p>
          </>
        )}
        {showGuestContent && (
          <h2 className="font-heading text-2xl font-semibold text-ink">Global Tarifler</h2>
        )}
      </header>

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
          onChange={(event) => updateCategory(event.target.value)}
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
            {hasActiveFilter ? 'Aramanızla eşleşen tarif yok' : 'Henüz global tarif eklenmedi'}
          </p>
        </div>
      )}

      {!isLoading && !isError && paginatedRecipes.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedRecipes.map((recipe) => (
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
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center rounded-t-2xl bg-cream text-sm text-muted">
                    Görsel yok
                  </div>
                )}

                <div className="p-5">
                  <h2 className="mb-2 min-w-0 break-words font-heading text-lg font-semibold text-ink">
                    {recipe.title}
                  </h2>
                  <p className="text-sm text-muted">{recipe.categoryName}</p>
                </div>
              </Link>
            ))}
          </div>

          <Pagination currentPage={safePage} totalPages={totalPages} buildPageUrl={buildPageUrl} />
        </>
      )}

      {showGuestContent && <GuestCta />}
    </div>
  );
}
