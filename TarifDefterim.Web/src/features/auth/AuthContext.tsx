import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '../../api/auth';
import { setUnauthorizedHandler } from '../../api/client';
import { AUTH_TOKEN_KEY, type LoginRequest, type RegisterRequest } from '../../api/types';

interface AuthContextValue {
  token: string | null;
  currentUserId: string | null;
  roles: string[];
  isAdmin: boolean;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchAndStoreCurrentUser(
  setCurrentUserId: (userId: string | null) => void,
  setRoles: (roles: string[]) => void,
): Promise<void> {
  const user = await authApi.getCurrentUser();
  setCurrentUserId(user.userId);
  setRoles(user.roles);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY);
    if (stored) {
      setToken(stored);
    } else {
      setIsAuthReady(true);
    }
  }, []);

  const storeAccessToken = useCallback((accessToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    }
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setToken(null);
    setCurrentUserId(null);
    setRoles([]);
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setCurrentUserId(null);
      setRoles([]);
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!token) {
      setCurrentUserId(null);
      setRoles([]);
      setIsAuthReady(true);
      return;
    }

    let cancelled = false;
    setIsAuthReady(false);

    fetchAndStoreCurrentUser(
      (userId) => {
        if (!cancelled) {
          setCurrentUserId(userId);
        }
      },
      (userRoles) => {
        if (!cancelled) {
          setRoles(userRoles);
        }
      },
    )
      .catch(() => {
        if (!cancelled) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_KEY);
          }
          setToken(null);
          setCurrentUserId(null);
          setRoles([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsAuthReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(
    async (data: LoginRequest) => {
      setIsLoading(true);
      try {
        const response = await authApi.login(data);
        storeAccessToken(response.accessToken);
      } finally {
        setIsLoading(false);
      }
    },
    [storeAccessToken],
  );

  const loginWithGoogleToken = useCallback(
    async (idToken: string) => {
      setIsLoading(true);
      try {
        const response = await authApi.loginWithGoogle(idToken);
        storeAccessToken(response.accessToken);
      } finally {
        setIsLoading(false);
      }
    },
    [storeAccessToken],
  );

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      currentUserId,
      roles,
      isAdmin: roles.includes('Admin'),
      isAuthenticated: isAuthReady && token !== null,
      isAuthReady,
      isLoading,
      login,
      loginWithGoogleToken,
      register,
      logout,
    }),
    [token, currentUserId, roles, isAuthReady, isLoading, login, loginWithGoogleToken, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
