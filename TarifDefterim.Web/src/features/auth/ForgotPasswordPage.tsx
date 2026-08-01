import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';

interface ForgotPasswordFormValues {
  email: string;
}

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setSubmitError(null);

    try {
      await forgotPassword(data.email.trim());
      setIsSubmitted(true);
    } catch {
      setSubmitError('İşlem tamamlanamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md p-8">
        {isSubmitted ? (
          <div className="text-center">
            <p className="mb-2 text-4xl" aria-hidden="true">
              ✉️
            </p>
            <h1 className="font-heading text-2xl font-semibold text-ink">Email Gönderildi</h1>
            <p className="mt-3 text-muted">
              Eğer bu email adresi kayıtlıysa, bir şifre sıfırlama linki gönderdik.
            </p>
            <Link to="/login" className="btn-primary mt-6 inline-flex">
              Giriş Yap
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-2 text-center font-heading text-2xl font-semibold text-ink">
              Şifremi Unuttum
            </h1>
            <p className="mb-6 text-center text-sm text-muted">
              Email adresinizi girin, size şifre sıfırlama linki gönderelim.
            </p>

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
                  placeholder="ornek@email.com"
                  {...register('email', {
                    required: 'Email gerekli',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Geçerli bir email adresi girin',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {submitError && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              <Link to="/login" className="font-medium text-accent hover:text-accent-dark">
                Giriş sayfasına dön
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
