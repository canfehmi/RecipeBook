import { Link } from 'react-router-dom';

export function AdminDashboardPage() {
  const sections = [
    {
      title: 'Global Tarifler',
      description: 'Global tarifleri listele, ekle, düzenle veya sil.',
      to: '/admin/recipes',
      emoji: '🍲',
    },
    {
      title: 'Kategoriler',
      description: 'Tarif kategorilerini yönet.',
      to: '/admin/categories',
      emoji: '🏷️',
    },
    {
      title: 'Aileler',
      description: 'Tüm aileleri ve üyelerini görüntüle.',
      to: '/admin/families',
      emoji: '👨‍👩‍👧‍👦',
    },
    {
      title: 'Kullanıcılar',
      description: 'Kullanıcı hesaplarını görüntüle ve kilitle.',
      to: '/admin/users',
      emoji: '👤',
    },
  ];

  return (
    <div>
      <h1 className="mb-2 font-heading text-3xl font-semibold text-ink">Admin Paneli</h1>
      <p className="mb-8 text-muted">Site yönetimi için aşağıdaki bölümlerden birini seçin.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="mb-3 block text-3xl" aria-hidden="true">
              {section.emoji}
            </span>
            <h2 className="mb-2 font-heading text-xl font-semibold text-ink group-hover:text-accent">
              {section.title}
            </h2>
            <p className="text-sm text-muted">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
