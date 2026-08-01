import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmEmail, resendConfirmation } from '../../api/auth';

type ConfirmStatus = 'loading' | 'success' | 'error';

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<ConfirmStatus>(
    userId && token ? 'loading' : 'error',
  );
  const [resendEmail, setResendEmail] = useState('');
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const hasConfirmed = useRef(false);

  useEffect(() => {
    if (!userId || !token || hasConfirmed.current) {
      return;
    }

    hasConfirmed.current = true;

    confirmEmail(userId, token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [userId, token]);

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resendEmail.trim()) {
      return;
    }

    setIsResending(true);
    setResendFeedback(null);
    try {
      await resendConfirmation(resendEmail.trim());
      setResendFeedback('Doğrulama emaili gönderildi.');
    } catch {
      setResendFeedback('Email gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md p-8 text-center">
        {status === 'loading' && (
          <>
            <p className="mb-2 text-4xl" aria-hidden="true">
              ✉️
            </p>
            <h1 className="font-heading text-2xl font-semibold text-ink">Doğrulanıyor...</h1>
            <p className="mt-3 text-muted">Email adresiniz doğrulanıyor, lütfen bekleyin.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <p className="mb-2 text-4xl" aria-hidden="true">
              ✅
            </p>
            <h1 className="font-heading text-2xl font-semibold text-ink">Email Adresiniz Doğrulandı!</h1>
            <p className="mt-3 text-muted">Artık hesabınıza giriş yapabilirsiniz.</p>
            <Link to="/login" className="btn-primary mt-6 inline-flex">
              Giriş Yap
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="mb-2 text-4xl" aria-hidden="true">
              ✉️
            </p>
            <h1 className="font-heading text-2xl font-semibold text-ink">Doğrulama Başarısız</h1>
            <p className="mt-3 text-muted">
              Doğrulama linki geçersiz olabilir veya süresi dolmuş olabilir. Yeni bir link
              isteyebilirsiniz.
            </p>

            <form onSubmit={handleResend} className="mt-6 space-y-3 text-left">
              <label htmlFor="resendEmail" className="label-field">
                Email
              </label>
              <input
                id="resendEmail"
                type="email"
                value={resendEmail}
                onChange={(event) => setResendEmail(event.target.value)}
                className="input-field"
                placeholder="ornek@email.com"
                required
              />
              <button type="submit" disabled={isResending} className="btn-primary w-full">
                {isResending ? 'Gönderiliyor...' : 'Tekrar Gönder'}
              </button>
            </form>

            {resendFeedback && (
              <p className="mt-4 rounded-2xl bg-secondary-bg px-4 py-3 text-sm text-secondary-text">
                {resendFeedback}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
