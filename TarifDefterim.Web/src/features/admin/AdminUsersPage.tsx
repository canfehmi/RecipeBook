import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { getAdminUsers, lockUser, unlockUser } from '../../api/admin';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import type { AdminUser } from '../../api/types';

function isLocked(user: AdminUser): boolean {
  if (!user.lockoutEnd) {
    return false;
  }
  return new Date(user.lockoutEnd) > new Date();
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [lockTarget, setLockTarget] = useState<AdminUser | null>(null);

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
  });

  const lockMutation = useMutation({
    mutationFn: (userId: string) => lockUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setLockTarget(null);
    },
  });

  const unlockMutation = useMutation({
    mutationFn: (userId: string) => unlockUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const isActionPending = lockMutation.isPending || unlockMutation.isPending;

  return (
    <div>
      <h1 className="mb-8 font-heading text-3xl font-semibold text-ink">Kullanıcılar</h1>

      {isLoading && <p className="text-muted">Yükleniyor...</p>}

      {isError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Kullanıcılar yüklenirken bir hata oluştu.
        </p>
      )}

      {!isLoading && !isError && (users ?? []).length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-cream/50 text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">İsim</th>
                  <th className="px-4 py-3 font-medium">Doğrulanmış</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium">Aile</th>
                  <th className="px-4 py-3 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((user) => {
                  const locked = isLocked(user);
                  return (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-ink">{user.email}</td>
                      <td className="px-4 py-3">{user.displayName}</td>
                      <td className="px-4 py-3">
                        {user.emailConfirmed ? (
                          <span className="text-green-700">Evet</span>
                        ) : (
                          <span className="text-muted">Hayır</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {locked ? (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                            Kilitli
                          </span>
                        ) : (
                          <span className="text-muted">Aktif</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {user.familyInviteCode ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {locked ? (
                            <button
                              type="button"
                              onClick={() => unlockMutation.mutate(user.id)}
                              disabled={isActionPending}
                              className="btn-secondary px-3 py-1 text-xs"
                            >
                              Kilidi Aç
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setLockTarget(user)}
                              disabled={isActionPending}
                              className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                            >
                              Kilitle
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={lockTarget !== null}
        onClose={() => setLockTarget(null)}
        onConfirm={() => lockTarget && lockMutation.mutate(lockTarget.id)}
        title="Kullanıcıyı Kilitle"
        message={
          lockTarget
            ? `${lockTarget.email} kullanıcısını kilitlemek istediğinize emin misiniz? Kullanıcı giriş yapamaz hale gelecektir.`
            : ''
        }
        confirmLabel="Kilitle"
        isPending={lockMutation.isPending}
      />

      {(lockMutation.isError || unlockMutation.isError) && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {(() => {
            const error = lockMutation.error ?? unlockMutation.error;
            return isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : 'İşlem sırasında bir hata oluştu.';
          })()}
        </p>
      )}
    </div>
  );
}
