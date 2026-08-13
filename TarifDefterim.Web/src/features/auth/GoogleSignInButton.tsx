import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface GoogleSignInButtonProps {
  onError?: (message: string) => void;
}

function getButtonWidth(container: HTMLElement): number | null {
  const width = Math.min(Math.floor(container.offsetWidth), 400);
  return width >= 40 ? width : null;
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

    const renderButton = () => {
      const width = getButtonWidth(container);
      if (!width || !window.google?.accounts?.id) {
        return;
      }

      container.innerHTML = '';
      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        locale: 'tr',
        width,
      });
    };

    const initialize = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        locale: 'tr',
      });
      renderButton();
    };

    let intervalId: number | undefined;

    if (window.google?.accounts?.id) {
      initialize();
    } else {
      intervalId = window.setInterval(() => {
        if (window.google?.accounts?.id) {
          window.clearInterval(intervalId);
          initialize();
        }
      }, 100);
    }

    const resizeObserver = new ResizeObserver(() => {
      renderButton();
    });
    resizeObserver.observe(container);

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
      resizeObserver.disconnect();
    };
  }, [handleCredentialResponse]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div
      ref={buttonRef}
      className={`w-full min-w-0 ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      aria-label="Google ile giriş yap"
    />
  );
}
