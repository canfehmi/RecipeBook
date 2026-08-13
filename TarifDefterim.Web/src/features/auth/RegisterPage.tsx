import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { resendConfirmation } from '../../api/auth';
import type { RegisterRequest } from '../../api/types';
import { useAuth } from './AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-card px-3 text-muted">veya</span>
      </div>
    </div>
  );
}

interface RegisterFormValues extends RegisterRequest {
  confirmPassword: string;
}

export function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  const onSubmit = async ({ email, password, displayName }: RegisterFormValues) => {
    setSubmitError(null);
    try {
      await registerUser({ email, password, displayName });
      setRegisteredEmail(email);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.errors?.[0]) {
        setSubmitError(error.response.data.errors[0]);
      } else if (isAxiosError(error) && error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError('Kayıt sırasında bir hata oluştu');
      }
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) {
      return;
    }

    setIsResending(true);
    setResendFeedback(null);
    try {
      await resendConfirmation(registeredEmail);
      setResendFeedback('Gönderildi');
    } catch {
      setResendFeedback('Email gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="flex min-h-[60vh] w-full min-w-0 items-center justify-center">
        <div className="card w-full min-w-0 max-w-md p-6 sm:p-8 text-center">
          <p className="mb-3 text-4xl" aria-hidden="true">
            ✉️
          </p>
          <h1 className="font-heading text-2xl font-semibold text-ink">Email Adresinizi Kontrol Edin</h1>
          <p className="mt-4 leading-relaxed text-muted">
            <span className="font-medium text-ink">{registeredEmail}</span> adresine bir doğrulama
            linki gönderdik. Hesabınıza giriş yapabilmek için lütfen emailinizdeki linke tıklayın.
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="btn-secondary mt-6"
          >
            {isResending ? 'Gönderiliyor...' : 'Emaili Tekrar Gönder'}
          </button>

          {resendFeedback && (
            <p className="mt-4 rounded-2xl bg-secondary-bg px-4 py-3 text-sm text-secondary-text">
              {resendFeedback}
            </p>
          )}

          <p className="mt-6 text-sm text-muted">
            <Link to="/login" className="font-medium text-accent hover:text-accent-dark">
              Giriş sayfasına dön
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] w-full min-w-0 items-center justify-center">
      <div className="card w-full min-w-0 max-w-md p-6 sm:p-8">
        <h1 className="mb-6 text-center font-heading text-2xl font-semibold text-ink">Kayıt Ol</h1>

        <GoogleSignInButton onError={setSubmitError} />

        <AuthDivider />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="label-field">
              Görünen Ad
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              className="input-field"
              {...register('displayName', { required: 'Görünen ad gerekli' })}
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="label-field">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input-field"
              {...register('email', { required: 'Email gerekli' })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label-field">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input-field"
              {...register('password', {
                required: 'Şifre gerekli',
                minLength: { value: 6, message: 'Şifre en az 6 karakter olmalı' },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
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
                validate: (value) => value === watch('password') || 'Şifreler eşleşmiyor',
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {submitError && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-dark">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
