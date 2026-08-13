import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Footer } from './Footer';
import { MobileNav, type MobileNavLink } from './MobileNav';

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function AppLayout() {
  const { isAuthenticated, isAdmin, isAuthReady, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const recipesLink = isAuthReady && isAuthenticated ? '/my-recipes' : '/';

  const mobileLinks: MobileNavLink[] = (() => {
    const links: MobileNavLink[] = [{ to: recipesLink, label: 'Tarifler' }];

    if (!isAuthReady) {
      return links;
    }

    if (isAuthenticated) {
      links.push(
        { to: '/my-recipes', label: 'Defterim' },
        { to: '/account', label: 'Hesabım' },
        { to: '/family', label: 'Ailem' },
      );
      if (isAdmin) {
        links.push({ to: '/admin', label: 'Admin', variant: 'accent' });
      }
      links.push({ to: '#', label: 'Çıkış Yap', onClick: logout, variant: 'secondary' });
      return links;
    }

    links.push(
      { to: '/login', label: 'Giriş Yap', variant: 'secondary' },
      { to: '/register', label: 'Kayıt Ol', variant: 'primary' },
    );
    return links;
  })();

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-cream">
      <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="shrink-0 font-heading text-xl font-semibold text-ink">
            Ata Tarifi
          </Link>

          <div className="hidden items-center gap-3 text-sm md:flex">
            <Link
              to={recipesLink}
              className="rounded-full px-3 py-1.5 text-ink transition hover:bg-cream"
            >
              Tarifler
            </Link>
            {!isAuthReady ? (
              <span className="text-muted">Yükleniyor...</span>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/my-recipes"
                  className="rounded-full px-3 py-1.5 text-ink transition hover:bg-cream"
                >
                  Defterim
                </Link>
                <Link
                  to="/account"
                  className="rounded-full px-3 py-1.5 text-ink transition hover:bg-cream"
                >
                  Hesabım
                </Link>
                <Link
                  to="/family"
                  className="rounded-full px-3 py-1.5 text-ink transition hover:bg-cream"
                >
                  Ailem
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="rounded-full px-3 py-1.5 text-accent transition hover:bg-cream"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-border px-4 py-1.5 text-ink transition hover:bg-cream"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary px-4 py-1.5">
                  Giriş Yap
                </Link>
                <Link to="/register" className="btn-primary px-4 py-1.5">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-ink transition hover:bg-cream md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>
        </div>

        <div id="mobile-nav">
          <MobileNav
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            links={mobileLinks}
          />
        </div>
      </nav>

      <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
