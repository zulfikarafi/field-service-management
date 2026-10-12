import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, JwtPayload, UserRole } from "../model/auth";

/**
 * Decode a JWT payload without verifying the signature (client side only).
 * The server is the source of truth for authorization.
 */
function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  return payload.exp * 1000 < Date.now();
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setToken: (token: string) => {
        const payload = decodeToken(token);
        if (!payload) {
          set({ token: null, user: null });
          return;
        }
        set({
          token,
          user: { userId: payload.userId, role: payload.role },
        });
      },

      logout: () => set({ token: null, user: null }),

      isAuthenticated: () => {
        const { token } = get();
        if (!token) return false;
        return !isTokenExpired(decodeToken(token));
      },

      hasRole: (...roles: UserRole[]) => {
        const { user } = get();
        return !!user && roles.includes(user.role);
      },
    }),
    {
      name: "fms-auth",
    }
  )
);
