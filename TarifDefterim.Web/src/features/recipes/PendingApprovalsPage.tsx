import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFamilyMembers } from '../../api/families';
import { approveRecipe, getPendingApprovalRecipes, rejectRecipe } from '../../api/recipes';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { FamilyMemberRole, type Recipe } from '../../api/types';
import { useAuth } from '../auth/AuthContext';

function parseSteps(steps: string): string[] {
  return steps
    .split('\n')
    .map((step) => step.trim())
    .filter(Boolean);
}

function PendingRecipeCard({
  recipe,
  isExpanded,
  onToggle,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  recipe: Recipe;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const sortedIngredients = [...recipe.ingredients].sort((a, b) => a.sortOrder - b.sortOrder);
  const stepList = parseSteps(recipe.steps);

  return (
    <article className="card overflow-hidden transition hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-4 text-left sm:p-5"
      >
        {recipe.coverImageUrl ? (
          <img
            src={recipe.coverImageUrl}
            alt={recipe.title}
            className="h-[120px] w-[120px] shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-2xl bg-cream text-xs text-muted">
            Görsel yok
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-ink">{recipe.title}</h2>
          <p className="mt-1 text-sm text-muted">{recipe.categoryName}</p>
          <p className="mt-2 text-sm text-ink">
            <span className="text-muted">{recipe.createdByDisplayName}</span> tarafından eklendi
          </p>
        </div>

        <span className="mt-1 shrink-0 text-muted">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-4 border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <div className="flex flex-wrap gap-2">
            <span className="badge">Hazırlık: {recipe.prepTimeMinutes} dk</span>
            <span className="badge">Pişirme: {recipe.cookTimeMinutes} dk</span>
            <span className="badge">{recipe.servings} kişilik</span>
          </div>

          <section className="rounded-2xl border border-border bg-cream p-4">
            <h3 className="font-heading mb-3 text-base font-semibold text-ink">Malzemeler</h3>
            <ul className="space-y-2">
              {sortedIngredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-center gap-2 text-sm text-ink">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <span>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-cream p-4">
            <h3 className="font-heading mb-3 text-base font-semibold text-ink">Adımlar</h3>
            {stepList.length > 0 ? (
              <ol className="space-y-3">
                {stepList.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm text-ink">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{recipe.steps}</p>
            )}
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onApprove}
              disabled={isApproving || isRejecting}
              className="btn-primary"
            >
              {isApproving ? 'Onaylanıyor...' : 'Onayla'}
            </button>
            <Link to={`/my-recipes/${recipe.id}/edit`} className="btn-secondary">
              Düzenle
            </Link>
            <button
              type="button"
              onClick={onReject}
              disabled={isApproving || isRejecting}
              className="rounded-full border border-red-200 bg-transparent px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRejecting ? 'Reddediliyor...' : 'Reddet'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export function PendingApprovalsPage() {
  const { currentUserId } = useAuth();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectRecipeId, setRejectRecipeId] = useState<string | null>(null);

  const membersQuery = useQuery({
    queryKey: ['family', 'members'],
    queryFn: getFamilyMembers,
  });

  const currentMember = useMemo(
    () => membersQuery.data?.find((member) => member.userId === currentUserId),
    [membersQuery.data, currentUserId],
  );

  const isHeadOfHousehold = currentMember?.role === FamilyMemberRole.HeadOfHousehold;

  const pendingQuery = useQuery({
    queryKey: ['recipes', 'pending-approval'],
    queryFn: getPendingApprovalRecipes,
    enabled: isHeadOfHousehold,
  });

  const approveMutation = useMutation({
    mutationFn: approveRecipe,
    onSuccess: async () => {
      setActionError(null);
      setExpandedId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['recipes', 'pending-approval'] }),
        queryClient.invalidateQueries({ queryKey: ['recipes', 'mine'] }),
      ]);
    },
    onError: (error) => {
      setActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Tarif onaylanamadı.',
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRecipe,
    onSuccess: async () => {
      setActionError(null);
      setExpandedId(null);
      setRejectRecipeId(null);
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'pending-approval'] });
    },
    onError: (error) => {
      setActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Tarif reddedilemedi.',
      );
    },
  });

  const handleRejectConfirm = () => {
    if (rejectRecipeId) {
      rejectMutation.mutate(rejectRecipeId);
    }
  };

  if (membersQuery.isLoading) {
    return <p className="text-muted">Yükleniyor...</p>;
  }

  if (!isHeadOfHousehold) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <p className="font-heading text-xl font-semibold text-ink">Bu sayfayı görüntüleme yetkiniz yok</p>
        <p className="mt-2 text-sm text-muted">Yalnızca aile büyüğü onay bekleyen tarifleri görebilir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold text-ink">Onay Bekleyen Tarifler</h1>

      {pendingQuery.isLoading && <p className="text-muted">Yükleniyor...</p>}

      {pendingQuery.isError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Tarifler yüklenirken bir hata oluştu.
        </p>
      )}

      {actionError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>
      )}

      {!pendingQuery.isLoading && !pendingQuery.isError && (pendingQuery.data ?? []).length === 0 && (
        <div className="card flex flex-col items-center justify-center border-dashed py-16 text-center">
          <span className="mb-3 text-4xl" aria-hidden="true">
            🍳
          </span>
          <p className="font-heading text-lg font-semibold text-ink">Onay bekleyen tarif yok</p>
          <p className="mt-2 text-sm text-muted">Aile üyeleri yeni tarif eklediğinde burada görünecek.</p>
        </div>
      )}

      {!pendingQuery.isLoading && !pendingQuery.isError && (pendingQuery.data ?? []).length > 0 && (
        <div className="space-y-4">
          {(pendingQuery.data ?? []).map((recipe) => (
            <PendingRecipeCard
              key={recipe.id}
              recipe={recipe}
              isExpanded={expandedId === recipe.id}
              onToggle={() => setExpandedId((current) => (current === recipe.id ? null : recipe.id))}
              onApprove={() => approveMutation.mutate(recipe.id)}
              onReject={() => setRejectRecipeId(recipe.id)}
              isApproving={approveMutation.isPending && approveMutation.variables === recipe.id}
              isRejecting={rejectMutation.isPending && rejectMutation.variables === recipe.id}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={rejectRecipeId !== null}
        onClose={() => {
          if (!rejectMutation.isPending) {
            setRejectRecipeId(null);
          }
        }}
        onConfirm={handleRejectConfirm}
        message="Bu tarifi reddetmek istediğinize emin misiniz?"
        confirmLabel={rejectMutation.isPending ? 'Reddediliyor...' : 'Evet, Reddet'}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
}
