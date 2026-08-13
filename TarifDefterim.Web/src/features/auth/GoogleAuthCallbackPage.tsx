import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

type CallbackStatus = 'loading' | 'error';

const errorMessages: Record<string, string> = {
  csrf: 'Google giriş isteği doğrulanamadı. Lütfen tekrar deneyin.',
  missing_credential: 'Google giriş bilgisi alınamadı. Lütfen tekrar deneyin.',
  invalid_token: 'Google oturumu doğrulanamadı. Lütfen tekrar deneyin.',
  unknown: 'Google ile giriş yapılamadı. Lütfen tekrar deneyin.',
};

export function GoogleAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeGoogleExchange } = useAuth();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }

    hasHandledCallback.current = true;

    const errorCode = searchParams.get('error');
    if (errorCode) {
      setStatus('error');
      setErrorMessage(errorMessages[errorCode] ?? errorMessages.unknown);
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      setErrorMessage('Geçersiz giriş bağlantısı.');
      return;
    }

    completeGoogleExchange(code)
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch(() => {
        setStatus('error');
        setErrorMessage('Google ile giriş tamamlanamadı. Lütfen tekrar deneyin.');
      });
  }, [completeGoogleExchange, navigate, searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md p-8 text-center">
        {status === 'loading' && (
          <>
            <p className="mb-2 text-4xl" aria-hidden="true">
              🔐
            </p>
            <h1 className="font-heading text-2xl font-semibold text-ink">Giriş yapılıyor...</h1>
            <p className="mt-3 text-muted">Google hesabınız doğrulanıyor, lütfen bekleyin.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="mb-2 text-4xl" aria-hidden="true">
              ⚠️
            </p>
            <h1 className="font-heading text-2xl font-semibold text-ink">Giriş Başarısız</h1>
            <p className="mt-3 text-muted">{errorMessage}</p>
            <Link to="/login" className="btn-primary mt-6 inline-flex">
              Giriş Sayfasına Dön
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
