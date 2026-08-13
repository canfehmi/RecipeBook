import { Link } from 'react-router-dom';

const legalLinks = [
  { to: '/gizlilik-politikasi', label: 'Gizlilik Politikası' },
  { to: '/kullanim-sozlesmesi', label: 'Kullanım / Üyelik Sözleşmesi' },
  { to: '/kvkk', label: 'KVKK Aydınlatma Metni' },
  { to: '/cerez-politikasi', label: 'Çerez Politikası' },
];

const infoLinks = [
  { to: '/hakkimizda', label: 'Hakkımızda' },
  { to: '/iletisim', label: 'İletişim' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="font-heading text-lg font-semibold text-ink">
              Ata Tarifi
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Ailenizin tariflerini tek bir yerde biriktirin, paylaşın ve nesilden nesile aktarın.
            </p>
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">Bilgi</h2>
            <ul className="mt-3 space-y-2">
              {infoLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">Yasal</h2>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="break-words text-sm text-muted transition hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-6 text-center text-xs text-muted">
          © {year} Ata Tarifi. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
