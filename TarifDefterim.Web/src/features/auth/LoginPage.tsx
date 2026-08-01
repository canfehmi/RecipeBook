import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { resendConfirmation } from '../../api/auth';
import type { LoginRequest } from '../../api/types';
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

interface LoginErrorData {
  code?: string;
  email?: string;
  message?: string;
}

function getLoginErrorData(error: unknown): LoginErrorData | null {
  if (!isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') {
    return null;
  }
  return error.response.data as LoginErrorData;
}

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setSubmitError(null);
    setNeedsEmailConfirmation(false);
    setUnconfirmedEmail(null);
    setIsLockedOut(false);
    setResendFeedback(null);

    try {
      await login(data);
      navigate('/');
    } catch (error) {
      const errorData = getLoginErrorData(error);

      if (errorData?.code === 'EmailNotConfirmed') {
        setNeedsEmailConfirmation(true);
        setUnconfirmedEmail(errorData.email ?? data.email.trim());
        setSubmitError('Hesabınız henüz onaylanmadı. Doğrulama emailini tekrar göndermek ister misiniz?');
        return;
      }

      if (errorData?.code === 'LockedOut') {
        setIsLockedOut(true);
        setSubmitError('Hesabınız kilitli, lütfen destek ile iletişime geçin');
        return;
      }

      setSubmitError('Email veya şifre hatalı');
    }
  };

  const handleResend = async () => {
    const email = unconfirmedEmail?.trim();
    if (!email) {
      setResendFeedback('Email adresi bulunamadı.');
      return;
    }

    setIsResending(true);
    setResendFeedback(null);
    try {
      await resendConfirmation(email);
      setResendFeedback('Email gönderildi');
    } catch {
      setResendFeedback('Email gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-6 text-center font-heading text-2xl font-semibold text-ink">Giriş Yap</h1>

        <GoogleSignInButton onError={setSubmitError} />

        <AuthDivider />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="label-field mb-0">
                Şifre
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-accent hover:text-accent-dark"
              >
                Şifremi Unuttum
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input-field"
              {...register('password', { required: 'Şifre gerekli' })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {submitError && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                isLockedOut
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {submitError}
            </p>
          )}

          {needsEmailConfirmation && (
            <div className="rounded-2xl border border-secondary-bg bg-secondary-bg/30 px-4 py-3 text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="btn-primary w-full"
              >
                {isResending ? 'Gönderiliyor...' : 'Evet, Gönder'}
              </button>
              {resendFeedback && <p className="mt-2 text-muted">{resendFeedback}</p>}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Hesabın yok mu?{' '}
          <Link to="/register" className="font-medium text-accent hover:text-accent-dark">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
