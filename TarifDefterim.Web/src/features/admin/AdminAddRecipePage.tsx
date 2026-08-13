import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useMatch, useNavigate } from 'react-router-dom';
import { createGlobalRecipe, updateGlobalRecipe } from '../../api/admin';
import { getCategories } from '../../api/categories';
import { uploadImage } from '../../api/images';
import { getGlobalRecipeById } from '../../api/recipes';
import type { CreateRecipeIngredient, Recipe, UpdateRecipe } from '../../api/types';
import {
  formatIngredientLabel,
  normalizeIngredientAmount,
  parseDraftAmount,
} from '../../utils/formatIngredient';

interface IngredientFormRow {
  name: string;
  amount: number | null;
  unit: string;
}

interface AdminRecipeFormValues {
  title: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  steps: string;
  servings: number;
  categoryId: string;
  coverImageUrl: string | null;
  ingredients: IngredientFormRow[];
}

const emptyDefaultValues: AdminRecipeFormValues = {
  title: '',
  prepTimeMinutes: 0,
  cookTimeMinutes: 0,
  steps: '',
  servings: 1,
  categoryId: '',
  coverImageUrl: null,
  ingredients: [],
};

function buildDefaultValues(recipe?: Recipe): AdminRecipeFormValues {
  if (!recipe) {
    return emptyDefaultValues;
  }

  const ingredients =
    recipe.ingredients.length > 0
      ? [...recipe.ingredients]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(({ name, amount, unit }) => ({
            name,
            amount: normalizeIngredientAmount(amount),
            unit,
          }))
      : [];

  return {
    title: recipe.title,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    steps: recipe.steps,
    servings: recipe.servings,
    categoryId: recipe.categoryId,
    coverImageUrl: recipe.coverImageUrl,
    ingredients,
  };
}

function buildSubmitPayload(data: AdminRecipeFormValues): UpdateRecipe {
  const ingredients: CreateRecipeIngredient[] = data.ingredients
    .filter((item) => item.name.trim())
    .map((item, index) => ({
      name: item.name.trim(),
      amount: item.amount,
      unit: item.unit.trim(),
      sortOrder: index,
    }));

  return {
    title: data.title.trim(),
    prepTimeMinutes: data.prepTimeMinutes,
    cookTimeMinutes: data.cookTimeMinutes,
    steps: data.steps.trim(),
    servings: data.servings,
    categoryId: data.categoryId,
    coverImageUrl: data.coverImageUrl,
    ingredients,
  };
}

const inputClass = 'input-field';
const labelClass = 'label-field';

interface DraftIngredient {
  name: string;
  amount: string;
  unit: string;
}

const emptyDraftIngredient: DraftIngredient = {
  name: '',
  amount: '',
  unit: '',
};

function buildIngredientsForSubmit(
  committed: IngredientFormRow[],
  draft: DraftIngredient,
): IngredientFormRow[] {
  const ingredients = [...committed];
  const draftName = draft.name.trim();

  if (draftName) {
    ingredients.push({
      name: draftName,
      amount: parseDraftAmount(draft.amount),
      unit: draft.unit.trim(),
    });
  }

  return ingredients;
}

export function AdminAddRecipePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftIngredient, setDraftIngredient] = useState<DraftIngredient>(emptyDraftIngredient);
  const [draftError, setDraftError] = useState<string | null>(null);
  const draftNameInputRef = useRef<HTMLInputElement>(null);

  const editMatch = useMatch({ path: '/admin/recipes/:id/edit', end: true });
  const editRecipeId = editMatch?.params.id;
  const isEditMode = !!editRecipeId;

  const recipeQuery = useQuery({
    queryKey: ['recipes', 'global', editRecipeId],
    queryFn: () => getGlobalRecipeById(editRecipeId!),
    enabled: isEditMode,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminRecipeFormValues>({
    defaultValues: emptyDefaultValues,
  });

  useEffect(() => {
    if (recipeQuery.data) {
      reset(buildDefaultValues(recipeQuery.data));
      setDraftIngredient(emptyDraftIngredient);
      setDraftError(null);
    }
  }, [recipeQuery.data, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const coverImageUrl = watch('coverImageUrl');
  const committedIngredients = watch('ingredients');

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (url) => {
      setValue('coverImageUrl', url);
    },
  });

  const createMutation = useMutation({
    mutationFn: createGlobalRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'global'] });
      navigate('/admin/recipes');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecipe }) =>
      updateGlobalRecipe(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'global'] });
      navigate('/admin/recipes');
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error ?? updateMutation.error;

  const clearDraftIngredient = () => {
    setDraftIngredient(emptyDraftIngredient);
    setDraftError(null);
  };

  const addDraftIngredient = () => {
    const name = draftIngredient.name.trim();
    if (!name) {
      setDraftError('Malzeme adı gerekli.');
      draftNameInputRef.current?.focus();
      return false;
    }

    append({
      name,
      amount: parseDraftAmount(draftIngredient.amount),
      unit: draftIngredient.unit.trim(),
    });
    clearDraftIngredient();
    draftNameInputRef.current?.focus();
    return true;
  };

  const handleDraftKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    addDraftIngredient();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const onSubmit = (data: AdminRecipeFormValues) => {
    setSubmitError(null);
    setDraftError(null);

    const ingredients = buildIngredientsForSubmit(data.ingredients, draftIngredient);
    const payload = buildSubmitPayload({ ...data, ingredients });

    if (payload.ingredients.length === 0) {
      setSubmitError('En az bir malzeme eklemelisiniz.');
      return;
    }

    if (draftIngredient.name.trim()) {
      clearDraftIngredient();
    }

    if (isEditMode && editRecipeId) {
      updateMutation.mutate({ id: editRecipeId, data: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const onInvalid = () => {
    const ingredients = buildIngredientsForSubmit(watch('ingredients'), draftIngredient);
    if (ingredients.filter((item) => item.name.trim()).length === 0) {
      setSubmitError('En az bir malzeme eklemelisiniz.');
    }
  };

  if (isEditMode && recipeQuery.isLoading) {
    return <p className="text-muted">Yükleniyor...</p>;
  }

  if (isEditMode && !recipeQuery.isLoading && !recipeQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="mb-4 text-muted">Tarif bulunamadı</p>
        <Link to="/admin/recipes" className="btn-secondary">
          ← Tariflere dön
        </Link>
      </div>
    );
  }

  const pageTitle = isEditMode ? 'Global Tarifi Düzenle' : 'Yeni Global Tarif';
  const submitLabel = isEditMode ? 'Değişiklikleri Kaydet' : 'Tarifi Kaydet';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-ink">{pageTitle}</h1>
        <Link to="/admin/recipes" className="btn-secondary px-4 py-1.5">
          ← Geri
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="card space-y-6 p-6 sm:p-8">
        <div>
          <label htmlFor="title" className={labelClass}>
            Başlık
          </label>
          <input
            id="title"
            type="text"
            className={inputClass}
            {...register('title', { required: 'Başlık gerekli' })}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="prepTimeMinutes" className={labelClass}>
              Hazırlık (dk)
            </label>
            <input
              id="prepTimeMinutes"
              type="number"
              min={0}
              className={inputClass}
              {...register('prepTimeMinutes', { valueAsNumber: true, min: 0 })}
            />
          </div>
          <div>
            <label htmlFor="cookTimeMinutes" className={labelClass}>
              Pişirme (dk)
            </label>
            <input
              id="cookTimeMinutes"
              type="number"
              min={0}
              className={inputClass}
              {...register('cookTimeMinutes', { valueAsNumber: true, min: 0 })}
            />
          </div>
          <div>
            <label htmlFor="servings" className={labelClass}>
              Porsiyon
            </label>
            <input
              id="servings"
              type="number"
              min={1}
              className={inputClass}
              {...register('servings', { valueAsNumber: true, min: 1 })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Kategori
          </label>
          <select
            id="categoryId"
            disabled={categoriesLoading}
            className={`${inputClass} disabled:bg-cream`}
            {...register('categoryId', { required: 'Kategori seçimi gerekli' })}
          >
            <option value="">Kategori seçin</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="steps" className={labelClass}>
            Adımlar
          </label>
          <textarea id="steps" rows={5} className={inputClass} {...register('steps')} />
        </div>

        <div>
          <label className={labelClass}>Kapak Görseli</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-border/50"
          />
          {uploadMutation.isPending && <p className="mt-2 text-sm text-muted">Yükleniyor...</p>}
          {uploadMutation.isError && (
            <p className="mt-2 text-sm text-red-600">Görsel yüklenemedi.</p>
          )}
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt="Kapak önizleme"
              className="mt-3 h-32 w-32 rounded-2xl object-cover"
            />
          )}
        </div>

        <div>
          <label className={labelClass}>Malzemeler</label>

          {fields.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {fields.map((field, index) => {
                const ingredient = committedIngredients[index];
                if (!ingredient) {
                  return null;
                }

                return (
                  <li
                    key={field.id}
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-cream py-1.5 pl-4 pr-2 text-sm text-ink"
                  >
                    <span className="min-w-0 break-words">
                      {formatIngredientLabel(
                        ingredient.name,
                        ingredient.amount,
                        ingredient.unit,
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`${ingredient.name} malzemesini sil`}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className={`space-y-3 ${fields.length > 0 ? 'mt-4' : 'mt-3'}`}>
            <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
              <input
                ref={draftNameInputRef}
                type="text"
                placeholder="Malzeme adı"
                value={draftIngredient.name}
                onChange={(event) => {
                  setDraftIngredient((current) => ({ ...current, name: event.target.value }));
                  if (draftError) {
                    setDraftError(null);
                  }
                }}
                onKeyDown={handleDraftKeyDown}
                className={`min-w-0 flex-1 ${inputClass}`}
              />
              <input
                type="number"
                step="any"
                min={0}
                placeholder="Miktar"
                value={draftIngredient.amount}
                onChange={(event) =>
                  setDraftIngredient((current) => ({ ...current, amount: event.target.value }))
                }
                onKeyDown={handleDraftKeyDown}
                className={`w-24 ${inputClass}`}
              />
              <input
                type="text"
                placeholder="Birim"
                value={draftIngredient.unit}
                onChange={(event) =>
                  setDraftIngredient((current) => ({ ...current, unit: event.target.value }))
                }
                onKeyDown={handleDraftKeyDown}
                className={`w-24 ${inputClass}`}
              />
            </div>

            <button
              type="button"
              onClick={addDraftIngredient}
              className="btn-secondary w-full border-accent/30 bg-secondary-bg/60 px-4 py-2.5 text-accent hover:bg-secondary-bg sm:w-auto"
            >
              + Malzeme Ekle
            </button>

            {draftError && <p className="text-sm text-red-600">{draftError}</p>}
          </div>
        </div>

        {(submitError || saveError) && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError ??
              (isAxiosError(saveError) && saveError.response?.data?.message
                ? saveError.response.data.message
                : 'Tarif kaydedilirken bir hata oluştu.')}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving || uploadMutation.isPending}
          className="btn-primary w-full"
        >
          {uploadMutation.isPending
            ? 'Görsel yükleniyor...'
            : isSaving
              ? 'Kaydediliyor...'
              : submitLabel}
        </button>
      </form>
    </div>
  );
}
