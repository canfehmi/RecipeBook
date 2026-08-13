/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_LOGIN_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import type { DehydratedState } from '@tanstack/react-query';

declare global {
  interface Window {
    google: any;
    __INITIAL_DATA__?: DehydratedState;
  }
}

export {};
