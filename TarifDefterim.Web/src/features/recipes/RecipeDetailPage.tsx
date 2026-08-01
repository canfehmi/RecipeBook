import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getFamilyMembers } from '../../api/families';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { createRecipe, deleteRecipe, approveRecipe, getGlobalRecipeById, getMyRecipes, rejectRecipe } from '../../api/recipes';
import { FamilyMemberRole, RecipeStatus, type CreateRecipe, type Recipe } from '../../api/types';
import { useAuth } from '../auth/AuthContext';

function recipeToCreatePayload(recipe: Recipe): CreateRecipe {
  return {
    title: recipe.title,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    steps: recipe.steps,
    servings: recipe.servings,
    categoryId: recipe.categoryId,
    coverImageUrl: recipe.coverImageUrl,
    sourceGlobalRecipeId: recipe.id,
    ingredients: [...recipe.ingredients]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item, index) => ({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        sortOrder: index,
      })),
  };
}

function parseSteps(steps: string): string[] {
  return steps
    .split('\n')
    .map((step) => step.trim())
    .filter(Boolean);
}

function RecipeContent({
  recipe,
  showPendingBadge,
  isPendingRestricted,
}: {
  recipe: Recipe;
  showPendingBadge: boolean;
  isPendingRestricted: boolean;
}) {
  const sortedIngredients = [...recipe.ingredients].sort((a, b) => a.sortOrder - b.sortOrder);
  const stepList = parseSteps(recipe.steps);

  return (
    <article className="space-y-8">
      {recipe.coverImageUrl ? (
        <img
          src={recipe.coverImageUrl}
          alt={recipe.title}
          className="max-h-[420px] w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex max-h-[420px] min-h-64 w-full items-center justify-center rounded-2xl bg-cream text-muted">
          Görsel yok
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="font-heading text-4xl font-semibold text-ink">{recipe.title}</h1>
          {showPendingBadge && recipe.status === RecipeStatus.PendingApproval && (
            <span className="badge mt-1 px-4 py-1.5 text-sm">Onay Bekliyor</span>
          )}
        </div>

        {isPendingRestricted ? (
          <div className="card border-secondary-bg bg-secondary-bg/30 p-6">
            <p className="leading-relaxed text-ink">
              Bu tarif henüz evin reisi tarafından onaylanmadı. Onaylandığında tüm detaylarını
              burada görebilirsiniz.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <span className="badge">{recipe.categoryName}</span>
              <span className="badge">Hazırlık: {recipe.prepTimeMinutes} dk</span>
              <span className="badge">Pişirme: {recipe.cookTimeMinutes} dk</span>
              <span className="badge">{recipe.servings} kişilik</span>
            </div>

            <section className="card p-6">
              <h2 className="font-heading mb-4 text-xl font-semibold text-ink">Malzemeler</h2>
              <ul className="space-y-3">
                {sortedIngredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-center gap-3 text-ink">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <span>
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card p-6">
              <h2 className="font-heading mb-4 text-xl font-semibold text-ink">Adımlar</h2>
              {stepList.length > 0 ? (
                <ol className="space-y-4">
                  {stepList.map((step, index) => (
                    <li key={index} className="flex gap-4 text-ink">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed text-muted">{recipe.steps}</p>
              )}
            </section>
          </>
        )}
      </div>
    </article>
  );
}

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, currentUserId } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [pendingActionError, setPendingActionError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<'delete' | 'reject-pending' | null>(null);
  const isMyRecipe = location.pathname.startsWith('/my-recipes/') && !location.pathname.endsWith('/edit');

  const globalQuery = useQuery({
    queryKey: ['recipes', 'global', id],
    queryFn: () => getGlobalRecipeById(id!),
    enabled: !!id && !isMyRecipe,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });

  const mineQuery = useQuery({
    queryKey: ['recipes', 'mine'],
    queryFn: getMyRecipes,
    enabled: !!id && (isMyRecipe || isAuthenticated),
  });

  const membersQuery = useQuery({
    queryKey: ['family', 'members'],
    queryFn: getFamilyMembers,
    enabled: isAuthenticated && isMyRecipe,
  });

  const currentMember = useMemo(
    () => membersQuery.data?.find((member) => member.userId === currentUserId),
    [membersQuery.data, currentUserId],
  );

  const isHeadOfHousehold = currentMember?.role === FamilyMemberRole.HeadOfHousehold;

  const isLoading = isMyRecipe ? mineQuery.isLoading : globalQuery.isLoading;

  const recipe = isMyRecipe
    ? mineQuery.data?.find((item) => item.id === id)
    : globalQuery.data;

  const alreadyInBook = useMemo(
    () =>
      !isMyRecipe &&
      isAuthenticated &&
      !!recipe &&
      (mineQuery.data?.some((item) => item.sourceGlobalRecipeId === recipe.id) ?? false),
    [isMyRecipe, isAuthenticated, recipe, mineQuery.data],
  );

  const isNotFound = isMyRecipe
    ? !mineQuery.isLoading && !mineQuery.isError && !recipe
    : !globalQuery.isLoading &&
      isAxiosError(globalQuery.error) &&
      globalQuery.error.response?.status === 404;

  const isError = isMyRecipe ? mineQuery.isError : globalQuery.isError && !isNotFound;

  const backLink = isMyRecipe ? '/my-recipes' : '/';
  const backLabel = isMyRecipe ? '← Tariflerime dön' : '← Tariflere dön';

  const addToBookMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: async () => {
      setAddModalOpen(false);
      setAddError(null);
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'mine'] });
      navigate('/my-recipes');
    },
    onError: (error) => {
      setAddError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Tarif defterinize eklenirken bir hata oluştu.',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: async () => {
      setConfirmDialog(null);
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'mine'] });
      navigate('/my-recipes');
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveRecipe,
    onSuccess: async () => {
      setPendingActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'mine'] });
    },
    onError: (error) => {
      setPendingActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Tarif onaylanamadı.',
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRecipe,
    onSuccess: async () => {
      setPendingActionError(null);
      setConfirmDialog(null);
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'mine'] });
      navigate('/my-recipes');
    },
    onError: (error) => {
      setPendingActionError(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Tarif reddedilemedi.',
      );
    },
  });

  const handleAddWithoutChanges = () => {
    if (!recipe) {
      return;
    }
    setAddError(null);
    addToBookMutation.mutate(recipeToCreatePayload(recipe));
  };

  const handleAddWithEdits = () => {
    if (!recipe) {
      return;
    }
    setAddModalOpen(false);
    setAddError(null);
    navigate('/my-recipes/add', { state: { prefillFrom: recipe } });
  };

  const handleCloseAddModal = () => {
    if (addToBookMutation.isPending) {
      return;
    }
    setAddModalOpen(false);
    setAddError(null);
  };

  const handleDelete = () => {
    if (!id) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const handleRejectPending = () => {
    if (!id) {
      return;
    }
    rejectMutation.mutate(id);
  };

  const showEditDelete =
    isMyRecipe && recipe?.status === RecipeStatus.Approved && isHeadOfHousehold;

  if (isLoading) {
    return <p className="text-muted">Yükleniyor...</p>;
  }

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="mb-4 text-muted">Tarif bulunamadı</p>
        <Link to={backLink} className="btn-secondary">
          {backLabel}
        </Link>
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="mb-4 text-red-600">Tarif yüklenirken bir hata oluştu.</p>
        <Link to={backLink} className="btn-secondary">
          {backLabel}
        </Link>
      </div>
    );
  }

  const isPendingRestrictedView =
    isMyRecipe && recipe.status === RecipeStatus.PendingApproval;

  const showPendingApprovalActions = isPendingRestrictedView && isHeadOfHousehold;
  const isPendingActionPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link to={backLink} className="btn-secondary inline-flex px-4 py-1.5">
          {backLabel}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {showEditDelete && (
            <>
              <Link to={`/my-recipes/${recipe.id}/edit`} className="btn-secondary">
                Düzenle
              </Link>
              <button
                type="button"
                onClick={() => setConfirmDialog('delete')}
                disabled={deleteMutation.isPending}
                className="rounded-full border border-red-200 bg-transparent px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
              </button>
            </>
          )}

          {!isMyRecipe && isAuthenticated && alreadyInBook && (
            <span className="rounded-full border border-border bg-cream px-5 py-2 text-sm text-muted">
              Bu tarif zaten defterinizde
            </span>
          )}

          {!isMyRecipe && isAuthenticated && !alreadyInBook && (
            <button type="button" onClick={() => setAddModalOpen(true)} className="btn-primary">
              Defterime Ekle
            </button>
          )}
        </div>
      </div>

      {deleteMutation.isError && (
        <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {isAxiosError(deleteMutation.error) && deleteMutation.error.response?.data?.message
            ? deleteMutation.error.response.data.message
            : 'Tarif silinirken bir hata oluştu.'}
        </p>
      )}

      <RecipeContent
        recipe={recipe}
        showPendingBadge={isMyRecipe}
        isPendingRestricted={isPendingRestrictedView}
      />

      {showPendingApprovalActions && (
        <div className="mt-8 space-y-4">
          {pendingActionError && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{pendingActionError}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => id && approveMutation.mutate(id)}
              disabled={isPendingActionPending}
              className="btn-primary"
            >
              {approveMutation.isPending ? 'Onaylanıyor...' : 'Onayla'}
            </button>
            <Link to={`/my-recipes/${recipe.id}/edit`} className="btn-secondary">
              Düzenle
            </Link>
            <button
              type="button"
              onClick={() => setConfirmDialog('reject-pending')}
              disabled={isPendingActionPending}
              className="rounded-full border border-red-200 bg-transparent px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rejectMutation.isPending ? 'Reddediliyor...' : 'Reddet'}
            </button>
          </div>
        </div>
      )}

      <Modal open={addModalOpen} onClose={handleCloseAddModal} title="Defterime Ekle">
        <p className="mb-6 leading-relaxed text-muted">
          Bu tarifi defterinize eklemek üzeresiniz. Üzerinde değişiklik yapmak ister misiniz?
        </p>

        {addError && (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{addError}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAddWithoutChanges}
            disabled={addToBookMutation.isPending}
            className="btn-primary flex-1"
          >
            {addToBookMutation.isPending ? 'Ekleniyor...' : 'Değiştirmeden Ekle'}
          </button>
          <button
            type="button"
            onClick={handleAddWithEdits}
            disabled={addToBookMutation.isPending}
            className="btn-secondary flex-1"
          >
            Düzenleyerek Ekle
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmDialog === 'delete'}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setConfirmDialog(null);
          }
        }}
        onConfirm={handleDelete}
        message="Bu tarifi silmek istediğinize emin misiniz?"
        confirmLabel={deleteMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
        isPending={deleteMutation.isPending}
      />

      <ConfirmModal
        open={confirmDialog === 'reject-pending'}
        onClose={() => {
          if (!rejectMutation.isPending) {
            setConfirmDialog(null);
          }
        }}
        onConfirm={handleRejectPending}
        message="Bu tarifi reddetmek istediğinize emin misiniz?"
        confirmLabel={rejectMutation.isPending ? 'Reddediliyor...' : 'Evet, Reddet'}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
}
