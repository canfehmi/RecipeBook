import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type ReactNode, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { bulkImportGlobalRecipes } from '../../api/admin';
import type { BulkImportRecipeItem, BulkImportRecipesResult } from '../../api/types';

function parseRecipesJson(raw: string): BulkImportRecipeItem[] {
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('JSON dosyası bir tarif dizisi içermelidir.');
  }

  return parsed as BulkImportRecipeItem[];
}

function ImportResultSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <details className="rounded-2xl border border-border bg-card">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink">
        {title} ({count})
      </summary>
      <div className="border-t border-border px-4 py-3">{children}</div>
    </details>
  );
}

export function AdminBulkImportRecipesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BulkImportRecipesResult | null>(null);

  const importMutation = useMutation({
    mutationFn: (items: BulkImportRecipeItem[]) => bulkImportGlobalRecipes(items),
    onSuccess: async (result) => {
      setImportResult(result);
      setClientError(null);
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'global'] });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setSelectedFileName(file?.name ?? null);
    setClientError(null);
    setImportResult(null);
    importMutation.reset();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setClientError(null);
    setImportResult(null);
    importMutation.reset();

    if (!selectedFile) {
      setClientError('Lütfen içe aktarmak için bir JSON dosyası seçin.');
      return;
    }

    try {
      const raw = await selectedFile.text();
      const items = parseRecipesJson(raw);

      if (items.length === 0) {
        setClientError('JSON dosyası en az bir tarif içermelidir.');
        return;
      }

      importMutation.mutate(items);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setClientError('Geçersiz JSON dosyası. Dosya biçimini kontrol edin.');
        return;
      }

      setClientError(
        error instanceof Error ? error.message : 'Dosya okunurken bir hata oluştu.',
      );
    }
  };

  const serverError =
    importMutation.isError && isAxiosError(importMutation.error)
      ? importMutation.error.response?.data?.message ??
        'Toplu içe aktarma sırasında bir hata oluştu.'
      : importMutation.isError
        ? 'Toplu içe aktarma sırasında bir hata oluştu.'
        : null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-ink">Toplu Tarif İçe Aktar</h1>
          <p className="mt-2 text-sm text-muted">
            JSON dosyasındaki tarifleri global tarif olarak sisteme ekleyin.
          </p>
        </div>
        <Link to="/admin/recipes" className="btn-secondary">
          Tariflere Dön
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-6 p-6">
        <div>
          <label htmlFor="recipe-json-file" className="label-field">
            JSON Dosyası
          </label>
          <input
            ref={fileInputRef}
            id="recipe-json-file"
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent/90"
          />
          {selectedFileName && (
            <p className="mt-2 text-sm text-muted">Seçilen dosya: {selectedFileName}</p>
          )}
        </div>

        {(clientError || serverError) && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {clientError ?? serverError}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={importMutation.isPending}
        >
          {importMutation.isPending ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
        </button>
      </form>

      {importResult && (
        <div className="mt-8 max-w-2xl space-y-4">
          <div className="card p-6">
            <h2 className="font-heading text-xl font-semibold text-ink">
              {importResult.successCount}/{importResult.totalCount} tarif başarıyla eklendi
            </h2>
            {importResult.successCount < importResult.totalCount && (
              <p className="mt-2 text-sm text-muted">
                Bazı tarifler kategori eşleşmesi, mükerrer başlık veya doğrulama nedeniyle
                atlandı.
              </p>
            )}
          </div>

          <ImportResultSection
            title="Kategori bulunamadı"
            count={importResult.skippedCategoryNotFound.length}
          >
            <ul className="space-y-2 text-sm text-muted">
              {importResult.skippedCategoryNotFound.map((item) => (
                <li key={`${item.title}-${item.category}`}>
                  <span className="font-medium text-ink">{item.title}</span>
                  {' — '}
                  <span>{item.category}</span>
                </li>
              ))}
            </ul>
          </ImportResultSection>

          <ImportResultSection
            title="Zaten mevcut (atlandı)"
            count={importResult.skippedDuplicateTitle.length}
          >
            <ul className="space-y-1 text-sm text-muted">
              {importResult.skippedDuplicateTitle.map((title) => (
                <li key={title} className="text-ink">
                  {title}
                </li>
              ))}
            </ul>
          </ImportResultSection>

          <ImportResultSection
            title="Doğrulama hatası"
            count={importResult.failedValidation.length}
          >
            <ul className="space-y-2 text-sm text-muted">
              {importResult.failedValidation.map((item, index) => (
                <li key={`${item.title}-${item.reason}-${index}`}>
                  <span className="font-medium text-ink">
                    {item.title || '(başlıksız)'}
                  </span>
                  {' — '}
                  <span>{item.reason}</span>
                </li>
              ))}
            </ul>
          </ImportResultSection>
        </div>
      )}
    </div>
  );
}
