import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getFamilyMembers } from '../../api/families';
import { getMyRecipes } from '../../api/recipes';
import { FamilyMemberRole, RecipeStatus } from '../../api/types';
import { useAuth } from '../auth/AuthContext';

export function MyRecipesPage() {
  const { currentUserId } = useAuth();

  const { data: recipes, isLoading, isError } = useQuery({
    queryKey: ['recipes', 'mine'],
    queryFn: getMyRecipes,
  });

  const membersQuery = useQuery({
    queryKey: ['family', 'members'],
    queryFn: getFamilyMembers,
  });

  const currentMember = useMemo(
    () => membersQuery.data?.find((member) => member.userId === currentUserId),
    [membersQuery.data, currentUserId],
  );

  const isHeadOfHousehold = currentMember?.role === FamilyMemberRole.HeadOfHousehold;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold text-ink">Tariflerim</h1>
        <div className="flex flex-wrap items-center gap-3">
          {isHeadOfHousehold && (
            <Link to="/pending-approvals" className="btn-secondary">
              Onay Bekleyenler
            </Link>
          )}
          <Link to="/my-recipes/add" className="btn-primary">
            Yeni Tarif Ekle
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-muted">Yükleniyor...</p>}

      {isError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Tarifler yüklenirken bir hata oluştu.
        </p>
      )}

      {!isLoading && !isError && (recipes ?? []).length === 0 && (
        <div className="card flex flex-col items-center justify-center border-dashed py-16">
          <p className="mb-4 text-muted">Henüz tarif eklemediniz</p>
          <Link to="/my-recipes/add" className="btn-primary">
            Tarif Ekle
          </Link>
        </div>
      )}

      {!isLoading && !isError && (recipes ?? []).length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(recipes ?? []).map((recipe) => (
            <Link
              key={recipe.id}
              to={`/my-recipes/${recipe.slug}`}
              className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {recipe.coverImageUrl ? (
                <img
                  src={recipe.coverImageUrl}
                  alt={recipe.title}
                  className="h-44 w-full rounded-t-2xl object-cover"
                />
              ) : (
                <div className="flex h-44 w-full items-center justify-center rounded-t-2xl bg-cream text-sm text-muted">
                  Görsel yok
                </div>
              )}

              <div className="p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="min-w-0 break-words font-heading text-lg font-semibold text-ink">{recipe.title}</h2>
                  {recipe.status === RecipeStatus.PendingApproval && (
                    <span className="badge shrink-0">Onay Bekliyor</span>
                  )}
                </div>
                <p className="text-sm text-muted">{recipe.categoryName}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
