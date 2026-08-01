import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/auth';

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
    const message = (error.response.data as { message?: string }).message;
    if (message) {
      return message;
    }
  }

  return 'Şifre sıfırlama başarısız. Link geçersiz veya süresi dolmuş olabilir.';
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(
    userId && token ? null : 'Geçersiz veya eksik sıfırlama linki.',
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>();

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!userId || !token) {
      setSubmitError('Geçersiz veya eksik sıfırlama linki.');
      return;
    }

    setSubmitError(null);

    try {
      await resetPassword(userId, token, data.newPassword);
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card w-full max-w-md p-8 text-center">
          <p className="mb-2 text-4xl" aria-hidden="true">
            ✅
          </p>
          <h1 className="font-heading text-2xl font-semibold text-ink">Şifreniz Güncellendi</h1>
          <p className="mt-3 text-muted">Artık yeni şifrenizle giriş yapabilirsiniz.</p>
          <Link to="/login" className="btn-primary mt-6 inline-flex">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-2 text-center font-heading text-2xl font-semibold text-ink">
          Yeni Şifre Belirle
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          Hesabınız için yeni bir şifre oluşturun.
        </p>

        {userId && token ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="label-field">
                Yeni Şifre
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className="input-field"
                {...register('newPassword', {
                  required: 'Şifre gerekli',
                  minLength: { value: 6, message: 'Şifre en az 6 karakter olmalı' },
                })}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label-field">
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="input-field"
                {...register('confirmPassword', {
                  required: 'Şifre tekrarı gerekli',
                  validate: (value) =>
                    value === newPasswordValue || 'Şifreler eşleşmiyor',
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {submitError && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
            <Link
              to="/forgot-password"
              className="mt-6 inline-flex font-medium text-accent hover:text-accent-dark"
            >
              Şifremi Unuttum sayfasına dön
            </Link>
          </div>
        )}

        {userId && token && submitError && (
          <p className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="font-medium text-accent hover:text-accent-dark">
              Şifremi Unuttum sayfasına dön
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
