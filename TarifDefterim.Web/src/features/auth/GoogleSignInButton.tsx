import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface GoogleSignInButtonProps {
  onError?: (message: string) => void;
}

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { loginWithGoogleToken, isLoading } = useAuth();

  const handleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      if (!response.credential) {
        onError?.('Google girişi tamamlanamadı.');
        return;
      }

      try {
        await loginWithGoogleToken(response.credential);
        navigate('/');
      } catch {
        onError?.('Google ile giriş yapılamadı.');
      }
    },
    [loginWithGoogleToken, navigate, onError],
  );

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const container = buttonRef.current;

    if (!clientId || !container) {
      return;
    }

    const initialize = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: container.offsetWidth || 400,
      });
    };

    if (window.google?.accounts?.id) {
      initialize();
      return;
    }

    const intervalId = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        window.clearInterval(intervalId);
        initialize();
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [handleCredentialResponse]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div
      ref={buttonRef}
      className={`w-full ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      aria-label="Google ile devam et"
    />
  );
}
