import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { getAdminPageContents, updatePageContent } from '../../api/pageContent';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Toast } from '../../components/ui/Toast';

export function AdminPageContentsPage() {
  const queryClient = useQueryClient();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null,
  );

  const { data: pages, isLoading, isError } = useQuery({
    queryKey: ['admin', 'page-content'],
    queryFn: getAdminPageContents,
  });

  useEffect(() => {
    if (!pages?.length) {
      return;
    }

    const selected = pages.find((page) => page.slug === selectedSlug) ?? pages[0];
    if (selectedSlug !== selected.slug) {
      setSelectedSlug(selected.slug);
    }
    setTitle(selected.title);
    setContentHtml(selected.contentHtml);
  }, [pages, selectedSlug]);

  const saveMutation = useMutation({
    mutationFn: () => updatePageContent(selectedSlug!, { title: title.trim(), contentHtml }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'page-content'] });
      await queryClient.invalidateQueries({ queryKey: ['page-content', selectedSlug] });
      setToast({ message: 'İçerik kaydedildi.', type: 'success' });
    },
    onError: (error) => {
      setToast({
        message:
          isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'İçerik kaydedilirken bir hata oluştu.',
        type: 'error',
      });
    },
  });

  const handleSelectPage = (slug: string) => {
    const page = pages?.find((item) => item.slug === slug);
    if (!page) {
      return;
    }

    setSelectedSlug(slug);
    setTitle(page.title);
    setContentHtml(page.contentHtml);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSlug || !title.trim()) {
      setToast({ message: 'Başlık gerekli.', type: 'error' });
      return;
    }

    saveMutation.mutate();
  };

  return (
    <div>
      <h1 className="mb-8 font-heading text-3xl font-semibold text-ink">İçerik Yönetimi</h1>

      {isLoading && <p className="text-muted">Yükleniyor...</p>}

      {isError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Sayfa içerikleri yüklenirken bir hata oluştu.
        </p>
      )}

      {!isLoading && !isError && pages && (
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="card p-3">
            <nav className="space-y-1">
              {pages.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  onClick={() => handleSelectPage(page.slug)}
                  className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    selectedSlug === page.slug
                      ? 'bg-accent text-white'
                      : 'text-ink hover:bg-cream'
                  }`}
                >
                  {page.title}
                </button>
              ))}
            </nav>
          </aside>

          <form onSubmit={handleSave} className="card space-y-4 p-6">
            <div>
              <label htmlFor="pageTitle" className="label-field">
                Başlık
              </label>
              <input
                id="pageTitle"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <p className="label-field">İçerik</p>
              <RichTextEditor value={contentHtml} onChange={setContentHtml} />
            </div>

            <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
              {saveMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
