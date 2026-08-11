import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { changePassword, getAccount, updateDisplayName } from '../../api/account';

interface DisplayNameFormValues {
  displayName: string;
}

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const inputClass = 'input-field';
const labelClass = 'label-field';

export function AccountSettingsPage() {
  const queryClient = useQueryClient();
  const [displayNameFeedback, setDisplayNameFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const accountQuery = useQuery({
    queryKey: ['account', 'me'],
    queryFn: getAccount,
  });

  const displayNameForm = useForm<DisplayNameFormValues>({
    defaultValues: { displayName: '' },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (accountQuery.data?.displayName) {
      displayNameForm.reset({ displayName: accountQuery.data.displayName });
    }
  }, [accountQuery.data?.displayName, displayNameForm]);

  const displayNameMutation = useMutation({
    mutationFn: (displayName: string) => updateDisplayName(displayName),
    onSuccess: async (result) => {
      setDisplayNameFeedback({ type: 'success', message: 'İsim güncellendi.' });
      displayNameForm.reset({ displayName: result.displayName });
      await queryClient.invalidateQueries({ queryKey: ['account', 'me'] });
    },
    onError: (error) => {
      setDisplayNameFeedback({
        type: 'error',
        message:
          isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'İsim güncellenirken bir hata oluştu.',
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordFormValues) =>
      changePassword(currentPassword, newPassword),
    onSuccess: async () => {
      setPasswordFeedback({ type: 'success', message: 'Şifre başarıyla güncellendi.' });
      passwordForm.reset();
      await queryClient.invalidateQueries({ queryKey: ['account', 'me'] });
    },
    onError: (error) => {
      setPasswordFeedback({
        type: 'error',
        message:
          isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'Şifre güncellenirken bir hata oluştu.',
      });
    },
  });

  const hasPassword = accountQuery.data?.hasPassword ?? true;

  const onDisplayNameSubmit = (data: DisplayNameFormValues) => {
    setDisplayNameFeedback(null);
    displayNameMutation.mutate(data.displayName.trim());
  };

  const onPasswordSubmit = (data: ChangePasswordFormValues) => {
    setPasswordFeedback(null);
    passwordMutation.mutate(data);
  };

  if (accountQuery.isLoading) {
    return <p className="text-muted">Yükleniyor...</p>;
  }

  if (accountQuery.isError) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
        Hesap bilgileri yüklenirken bir hata oluştu.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-heading text-3xl font-semibold text-ink">Hesap Ayarları</h1>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="font-heading text-xl font-semibold text-ink">İsim Değiştir</h2>

        <form onSubmit={displayNameForm.handleSubmit(onDisplayNameSubmit)} className="space-y-4">
          <div>
            <label htmlFor="displayName" className={labelClass}>
              Görünen Ad
            </label>
            <input
              id="displayName"
              type="text"
              className={inputClass}
              {...displayNameForm.register('displayName', { required: 'Görünen ad gerekli' })}
            />
            {displayNameForm.formState.errors.displayName && (
              <p className="mt-1 text-sm text-red-600">
                {displayNameForm.formState.errors.displayName.message}
              </p>
            )}
          </div>

          {displayNameFeedback && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                displayNameFeedback.type === 'success'
                  ? 'bg-secondary-bg text-secondary-text'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {displayNameFeedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={displayNameMutation.isPending}
            className="btn-primary"
          >
            {displayNameMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </section>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="font-heading text-xl font-semibold text-ink">
          {hasPassword ? 'Şifre Değiştir' : 'Şifre Ekle'}
        </h2>

        {!hasPassword && (
          <p className="text-sm text-muted">
            Google ile giriş yaptınız. Email ve şifre ile de giriş yapabilmek için bir şifre
            belirleyebilirsiniz.
          </p>
        )}

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {hasPassword && (
            <div>
              <label htmlFor="currentPassword" className={labelClass}>
                Mevcut Şifre
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className={inputClass}
                {...passwordForm.register('currentPassword', {
                  required: hasPassword ? 'Mevcut şifre gerekli' : false,
                })}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className={labelClass}>
              Yeni Şifre
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...passwordForm.register('newPassword', {
                required: 'Yeni şifre gerekli',
                minLength: { value: 6, message: 'Şifre en az 6 karakter olmalı' },
              })}
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Yeni Şifre (Tekrar)
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...passwordForm.register('confirmPassword', {
                required: 'Şifre tekrarı gerekli',
                validate: (value) =>
                  value === passwordForm.watch('newPassword') || 'Şifreler eşleşmiyor',
              })}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {passwordFeedback && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                passwordFeedback.type === 'success'
                  ? 'bg-secondary-bg text-secondary-text'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {passwordFeedback.message}
            </p>
          )}

          <button type="submit" disabled={passwordMutation.isPending} className="btn-primary">
            {passwordMutation.isPending
              ? 'Kaydediliyor...'
              : hasPassword
                ? 'Şifreyi Güncelle'
                : 'Şifre Ekle'}
          </button>
        </form>
      </section>
    </div>
  );
}
