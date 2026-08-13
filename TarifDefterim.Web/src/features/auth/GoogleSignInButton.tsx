import { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
  onError?: (message: string) => void;
}

const RESIZE_DEBOUNCE_MS = 200;

function getButtonWidth(container: HTMLElement): number | null {
  const width = Math.min(Math.floor(container.offsetWidth), 400);
  return width >= 40 ? width : null;
}

function getGoogleLoginUri(): string | null {
  const explicitLoginUri = import.meta.env.VITE_GOOGLE_LOGIN_URI?.trim().replace(/\/$/, '');
  if (explicitLoginUri) {
    return explicitLoginUri;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (!apiBaseUrl) {
    return null;
  }

  return `${apiBaseUrl}/auth/google/callback`;
}

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const lastRenderedWidthRef = useRef<number | null>(null);
  const resizeDebounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const loginUri = getGoogleLoginUri();
    const container = buttonRef.current;

    if (!clientId || !loginUri || !container) {
      if (!loginUri) {
        onError?.('Google giriş adresi yapılandırılmamış.');
      }
      return;
    }

    const renderButton = () => {
      const width = getButtonWidth(container);
      if (!width || !window.google?.accounts?.id) {
        return;
      }

      if (width === lastRenderedWidthRef.current && container.childElementCount > 0) {
        return;
      }

      lastRenderedWidthRef.current = width;
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

    const scheduleRenderButton = () => {
      window.clearTimeout(resizeDebounceRef.current);
      resizeDebounceRef.current = window.setTimeout(renderButton, RESIZE_DEBOUNCE_MS);
    };

    const initialize = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: 'redirect',
        login_uri: loginUri,
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

    const resizeObserver = new ResizeObserver(scheduleRenderButton);
    resizeObserver.observe(container);

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
      window.clearTimeout(resizeDebounceRef.current);
      resizeObserver.disconnect();
    };
  }, [onError]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div
      ref={buttonRef}
      className="w-full min-w-0"
      aria-label="Google ile giriş yap"
    />
  );
}
