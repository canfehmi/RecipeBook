import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LegalPageLayoutProps {
  title: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl min-w-0">
      <Link to="/" className="mb-6 inline-flex text-sm text-muted transition hover:text-accent">
        ← Ana sayfaya dön
      </Link>
      <h1 className="font-heading text-3xl font-semibold text-ink">{title}</h1>
      <div className="prose-legal mt-8 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
        {children}
      </div>
    </article>
  );
}
