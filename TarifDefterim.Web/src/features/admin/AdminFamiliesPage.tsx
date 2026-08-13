import { useQuery } from '@tanstack/react-query';
import { getAdminFamilies } from '../../api/admin';
import { FamilyMemberRole } from '../../api/types';

function roleLabel(role: number): string {
  return role === FamilyMemberRole.HeadOfHousehold ? 'Aile Büyüğü' : 'Üye';
}

export function AdminFamiliesPage() {
  const { data: families, isLoading, isError } = useQuery({
    queryKey: ['admin', 'families'],
    queryFn: getAdminFamilies,
  });

  return (
    <div>
      <h1 className="mb-8 font-heading text-3xl font-semibold text-ink">Aileler</h1>

      {isLoading && <p className="text-muted">Yükleniyor...</p>}

      {isError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Aileler yüklenirken bir hata oluştu.
        </p>
      )}

      {!isLoading && !isError && (families ?? []).length === 0 && (
        <div className="card border-dashed py-16 text-center text-muted">Henüz aile yok.</div>
      )}

      <div className="space-y-6">
        {(families ?? []).map((family) => (
          <div key={family.id} className="card overflow-hidden">
            <div className="border-b border-border bg-cream/50 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted">Davet Kodu</p>
                  <p className="font-mono text-lg font-semibold text-ink">{family.inviteCode}</p>
                </div>
                <div className="text-right text-sm text-muted">
                  <p>{family.members.length} üye</p>
                  <p>{new Date(family.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">İsim</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {family.members.map((member) => (
                    <tr key={member.userId} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 text-ink">{member.displayName}</td>
                      <td className="px-5 py-3 text-muted">{member.email}</td>
                      <td className="px-5 py-3 text-muted">{roleLabel(member.role)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
