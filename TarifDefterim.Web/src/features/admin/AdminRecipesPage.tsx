import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteGlobalRecipe } from '../../api/admin';
import { getGlobalRecipes } from '../../api/recipes';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export function AdminRecipesPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const { data: recipes, isLoading, isError } = useQuery({
    queryKey: ['recipes', 'global'],
    queryFn: () => getGlobalRecipes(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGlobalRecipe(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'global'] });
      setDeleteTarget(null);
    },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold text-ink">Global Tarifler</h1>
        <Link to="/admin/recipes/add" className="btn-primary">
          Yeni Global Tarif Ekle
        </Link>
      </div>

      {isLoading && <p className="text-muted">Yükleniyor...</p>}

      {isError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Tarifler yüklenirken bir hata oluştu.
        </p>
      )}

      {!isLoading && !isError && (recipes ?? []).length === 0 && (
        <div className="card border-dashed py-16 text-center text-muted">
          Henüz global tarif eklenmedi.
        </div>
      )}

      {!isLoading && !isError && (recipes ?? []).length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-cream/50 text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Görsel</th>
                  <th className="px-4 py-3 font-medium">Başlık</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {(recipes ?? []).map((recipe) => (
                  <tr key={recipe.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      {recipe.coverImageUrl ? (
                        <img
                          src={recipe.coverImageUrl}
                          alt={recipe.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cream text-xs text-muted">
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{recipe.title}</td>
                    <td className="px-4 py-3 text-muted">{recipe.categoryName}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/recipes/${recipe.id}/edit`}
                          className="btn-secondary px-3 py-1 text-xs"
                        >
                          Düzenle
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: recipe.id, title: recipe.title })}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Tarifi Sil"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" global tarifini silmek istediğinize emin misiniz?`
            : ''
        }
        confirmLabel="Sil"
        isPending={deleteMutation.isPending}
      />

      {deleteMutation.isError && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {isAxiosError(deleteMutation.error) && deleteMutation.error.response?.data?.message
            ? deleteMutation.error.response.data.message
            : 'Tarif silinirken bir hata oluştu.'}
        </p>
      )}
    </div>
  );
}
