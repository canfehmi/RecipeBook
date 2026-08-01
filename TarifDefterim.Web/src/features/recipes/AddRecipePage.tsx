import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { getCategories } from '../../api/categories';
import { uploadImage } from '../../api/images';
import { createRecipe, getMyRecipes, updateRecipe } from '../../api/recipes';
import type { CreateRecipeIngredient, Recipe, UpdateRecipe } from '../../api/types';

interface IngredientFormRow {
  name: string;
  amount: number;
  unit: string;
}

interface AddRecipeFormValues {
  title: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  steps: string;
  servings: number;
  categoryId: string;
  coverImageUrl: string | null;
  ingredients: IngredientFormRow[];
}

interface AddRecipeLocationState {
  prefillFrom?: Recipe;
}

const emptyDefaultValues: AddRecipeFormValues = {
  title: '',
  prepTimeMinutes: 0,
  cookTimeMinutes: 0,
  steps: '',
  servings: 1,
  categoryId: '',
  coverImageUrl: null,
  ingredients: [{ name: '', amount: 0, unit: '' }],
};

function buildDefaultValues(prefill?: Recipe): AddRecipeFormValues {
  if (!prefill) {
    return emptyDefaultValues;
  }

  const ingredients =
    prefill.ingredients.length > 0
      ? [...prefill.ingredients]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(({ name, amount, unit }) => ({ name, amount, unit }))
      : [{ name: '', amount: 0, unit: '' }];

  return {
    title: prefill.title,
    prepTimeMinutes: prefill.prepTimeMinutes,
    cookTimeMinutes: prefill.cookTimeMinutes,
    steps: prefill.steps,
    servings: prefill.servings,
    categoryId: prefill.categoryId,
    coverImageUrl: prefill.coverImageUrl,
    ingredients,
  };
}

function buildSubmitPayload(data: AddRecipeFormValues): UpdateRecipe {
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

export function AddRecipePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const editMatch = useMatch({ path: '/my-recipes/:id/edit', end: true });
  const editRecipeId = editMatch?.params.id;
  const isEditMode = !!editRecipeId;

  const prefillFrom = !isEditMode
    ? (location.state as AddRecipeLocationState | null)?.prefillFrom
    : undefined;
  const sourceGlobalRecipeId = prefillFrom?.id ?? null;

  const mineQuery = useQuery({
    queryKey: ['recipes', 'mine'],
    queryFn: getMyRecipes,
    enabled: isEditMode,
  });

  const editRecipe = useMemo(
    () => mineQuery.data?.find((recipe) => recipe.id === editRecipeId),
    [mineQuery.data, editRecipeId],
  );

  const formSource = isEditMode ? editRecipe : prefillFrom;

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
  } = useForm<AddRecipeFormValues>({
    defaultValues: emptyDefaultValues,
  });

  useEffect(() => {
    if (formSource) {
      reset(buildDefaultValues(formSource));
    }
  }, [formSource, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const coverImageUrl = watch('coverImageUrl');

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (url) => {
      setValue('coverImageUrl', url);
    },
  });

  const createMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'mine'] });
      navigate('/my-recipes');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecipe }) => updateRecipe(id, data),
    onSuccess: async (_recipe, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['recipes', 'mine'] });
      navigate(`/my-recipes/${variables.id}`);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error ?? updateMutation.error;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const onSubmit = (data: AddRecipeFormValues) => {
    setSubmitError(null);

    const payload = buildSubmitPayload(data);

    if (payload.ingredients.length === 0) {
      setSubmitError('En az bir malzeme eklemelisiniz.');
      return;
    }

    if (isEditMode && editRecipeId) {
      updateMutation.mutate({ id: editRecipeId, data: payload });
      return;
    }

    createMutation.mutate({
      ...payload,
      sourceGlobalRecipeId,
    });
  };

  const onInvalid = () => {
    const filledIngredients = watch('ingredients').filter((item) => item.name.trim());
    if (filledIngredients.length === 0) {
      setSubmitError('En az bir malzeme eklemelisiniz.');
    }
  };

  if (isEditMode && mineQuery.isLoading) {
    return <p className="text-muted">Yükleniyor...</p>;
  }

  if (isEditMode && !mineQuery.isLoading && !editRecipe) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="mb-4 text-muted">Tarif bulunamadı</p>
        <Link to="/my-recipes" className="btn-secondary">
          ← Tariflerime dön
        </Link>
      </div>
    );
  }

  const backLink = isEditMode && editRecipeId ? `/my-recipes/${editRecipeId}` : '/my-recipes';
  const pageTitle = isEditMode ? 'Tarifi Düzenle' : 'Yeni Tarif Ekle';
  const submitLabel = isEditMode ? 'Değişiklikleri Kaydet' : 'Tarifi Kaydet';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-ink">{pageTitle}</h1>
        <Link to={backLink} className="btn-secondary px-4 py-1.5">
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
          <div className="mb-2 flex items-center justify-between">
            <label className={labelClass}>Malzemeler</label>
            <button
              type="button"
              onClick={() => append({ name: '', amount: 0, unit: '' })}
              className="text-sm font-medium text-accent hover:text-accent-dark"
            >
              + Malzeme Ekle
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                <input
                  type="text"
                  placeholder="Malzeme adı"
                  className={`min-w-0 flex-1 ${inputClass}`}
                  {...register(`ingredients.${index}.name` as const)}
                />
                <input
                  type="number"
                  step="any"
                  min={0}
                  placeholder="Miktar"
                  className={`w-24 ${inputClass}`}
                  {...register(`ingredients.${index}.amount` as const, { valueAsNumber: true })}
                />
                <input
                  type="text"
                  placeholder="Birim"
                  className={`w-24 ${inputClass}`}
                  {...register(`ingredients.${index}.unit` as const)}
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sil
                  </button>
                )}
              </div>
            ))}
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
