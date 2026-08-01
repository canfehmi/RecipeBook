import { Link, NavLink, Outlet } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-accent text-white' : 'text-ink hover:bg-cream'
  }`;

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
              Admin Paneli
            </span>
            <Link to="/admin" className="font-heading text-lg font-semibold text-ink">
              Yönetim
            </Link>
          </div>
          <Link to="/" className="btn-secondary px-4 py-1.5 text-sm">
            Siteye Dön
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <aside className="hidden w-48 shrink-0 sm:block">
          <nav className="card sticky top-8 space-y-1 p-3">
            <NavLink to="/admin/recipes" className={navLinkClass}>
              Tarifler
            </NavLink>
            <NavLink to="/admin/categories" className={navLinkClass}>
              Kategoriler
            </NavLink>
            <NavLink to="/admin/families" className={navLinkClass}>
              Aileler
            </NavLink>
            <NavLink to="/admin/users" className={navLinkClass}>
              Kullanıcılar
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
