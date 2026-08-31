import { create } from "zustand";
import { AuthState, AuthUser } from "../types/auth";
import * as SecureStore from "expo-secure-store";
import { useWorkspaceStore } from "./useWorkspaceStore";

const TOKEN_KEY = "jivnicare_doctor_token";
const USER_KEY = "jivnicare_doctor_user";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // Default to false for instant 0ms mount of Partner Intro

  setAuth: (user: AuthUser, token: string) => {
    try {
      SecureStore.setItemAsync(TOKEN_KEY, token);
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (e) {
      // Secure store fallback
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    try {
      SecureStore.deleteItemAsync(TOKEN_KEY);
      SecureStore.deleteItemAsync(USER_KEY);
    } catch (e) {
      // Secure store fallback
    }
    useWorkspaceStore.getState().clearWorkspace();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (partial: Partial<AuthUser>) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partial };
      try {
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated));
      } catch (e) {}
      return { user: updated };
    });
  },
}));

// Hydrate stored session on startup
export async function initializeAuthSession() {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    if (token && userStr) {
      const user = JSON.parse(userStr);
      useAuthStore.getState().setAuth(user, token);
    }
  } catch (e) {
    // Graceful fallback to unauthenticated state
  }
}
