import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export function AppLayout() {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-heading text-xl font-semibold text-ink">
            Tarif Defterim
          </Link>

          <div className="flex items-center gap-3 text-sm">
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-recipes"
                  className="rounded-full px-3 py-1.5 text-ink transition hover:bg-cream"
                >
                  Defterim
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
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
