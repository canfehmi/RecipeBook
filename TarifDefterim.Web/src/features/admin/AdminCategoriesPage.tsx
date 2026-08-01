import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { deleteCategory, updateCategory } from '../../api/admin';
import { createCategory, getCategories } from '../../api/categories';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import type { Category } from '../../api/types';

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
      setCreateError(null);
    },
    onError: (error) => {
      setCreateError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Kategori eklenirken bir hata oluştu.',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
      setEditName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
      setDeleteError(null);
    },
    onError: (error) => {
      setDeleteError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Kategori silinirken bir hata oluştu.',
      );
    },
  });

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) {
      return;
    }
    setCreateError(null);
    createMutation.mutate(newName.trim());
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) {
      return;
    }
    updateMutation.mutate({ id, name: editName.trim() });
  };

  return (
    <div>
      <h1 className="mb-8 font-heading text-3xl font-semibold text-ink">Kategoriler</h1>

      <form onSubmit={handleCreate} className="card mb-8 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-0 flex-1">
          <label htmlFor="newCategory" className="label-field">
            Yeni Kategori
          </label>
          <input
            id="newCategory"
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            className="input-field"
            placeholder="Kategori adı"
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending || !newName.trim()}
          className="btn-primary"
        >
          {createMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
        </button>
      </form>

      {createError && (
        <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{createError}</p>
      )}

      {isLoading && <p className="text-muted">Yükleniyor...</p>}

      {isError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Kategoriler yüklenirken bir hata oluştu.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="card divide-y divide-border">
          {(categories ?? []).length === 0 && (
            <p className="p-6 text-center text-muted">Henüz kategori yok.</p>
          )}

          {(categories ?? []).map((category) => (
            <div
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              {editingId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="input-field min-w-0 flex-1"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(category.id)}
                      disabled={updateMutation.isPending}
                      className="btn-primary px-3 py-1 text-xs"
                    >
                      Kaydet
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn-secondary px-3 py-1 text-xs"
                    >
                      Vazgeç
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-medium text-ink">{category.name}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="btn-secondary px-3 py-1 text-xs"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(category);
                      }}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {updateMutation.isError && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {isAxiosError(updateMutation.error) && updateMutation.error.response?.data?.message
            ? updateMutation.error.response.data.message
            : 'Kategori güncellenirken bir hata oluştu.'}
        </p>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Kategoriyi Sil"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" kategorisini silmek istediğinize emin misiniz?`
            : ''
        }
        confirmLabel="Sil"
        isPending={deleteMutation.isPending}
      />

      {deleteError && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</p>
      )}
    </div>
  );
}
