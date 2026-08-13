import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MobileNavLink {
  to: string;
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  onClick?: () => void;
}

export type { MobileNavLink };

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: MobileNavLink[];
}

const linkStyles: Record<NonNullable<MobileNavLink['variant']>, string> = {
  default: 'text-ink hover:bg-cream',
  primary: 'bg-accent text-white hover:bg-accent-dark',
  secondary: 'border border-border text-ink hover:bg-cream',
  accent: 'text-accent hover:bg-cream',
};

export function MobileNav({ open, onClose, links }: MobileNavProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="border-t border-border bg-card md:hidden">
      <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3" aria-label="Mobil menü">
        {links.map((link) =>
          link.onClick ? (
            <button
              key={link.label}
              type="button"
              onClick={() => {
                link.onClick?.();
                onClose();
              }}
              className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${linkStyles[link.variant ?? 'default']}`}
            >
              {link.label}
            </button>
          ) : (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition ${linkStyles[link.variant ?? 'default']}`}
            >
              {link.label}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
