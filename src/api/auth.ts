import { apiClient, DEFAULT_API_BASE_URL } from "./client";
import { AuthUser } from "../types/auth";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";

WebBrowser.maybeCompleteAuthSession();

export const authApi = {
  /**
   * Hydrate identity & doctor role from Bearer token
   * GET /api/auth/me
   */
  getMe: async (): Promise<{ authenticated: boolean; user: AuthUser | null }> => {
    return apiClient("/api/auth/me");
  },

  /**
   * Set OAuth flow to 'doctor' prior to Google SignIn
   * POST /api/auth/oauth-flow
   */
  setOAuthFlow: async (): Promise<{ success: boolean }> => {
    return apiClient("/api/auth/oauth-flow", {
      method: "POST",
      body: JSON.stringify({ flow: "doctor" }),
    });
  },

  /**
   * Native Google OAuth Sign-In for Doctors (Matching Web NextAuth Flow)
   * Uses Native OAuth session with direct account picker and returns to deep-link
   */
  signInWithGoogle: async (): Promise<{
    success: boolean;
    token?: string;
    user?: AuthUser;
    isNewDoctor?: boolean;
  }> => {
    try {
      // 1. Set backend OAuth flow to 'doctor'
      await authApi.setOAuthFlow().catch(() => {});

      // 2. Create redirect URI for native mobile return
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "jivnicare-doctor",
        path: "auth-callback",
      });

      // 3. Initiate Google OAuth through backend's NextAuth Google provider on live jinnicare.com
      const callbackUrl = `/api/auth/session-callback?flow=doctor&client=mobile&redirect_uri=${encodeURIComponent(redirectUri)}`;
      const authUrl = `${DEFAULT_API_BASE_URL}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success" && result.url) {
        const parsed = Linking.parse(result.url);
        const token =
          (parsed.queryParams?.token as string) ||
          (parsed.queryParams?.session_token as string);
        const isNewDoctorParam = parsed.queryParams?.isNewDoctor as string | undefined;

        if (token) {
          const meRes = await apiClient<{ authenticated: boolean; user: AuthUser | null }>(
            "/api/auth/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (meRes.authenticated && meRes.user) {
            return {
              success: true,
              token,
              user: meRes.user,
              isNewDoctor: isNewDoctorParam !== undefined ? isNewDoctorParam === "true" : !meRes.user.doctorId,
            };
          }
        }
      }

      // 4. Session hydration fallback from browser session
      const meRes = await apiClient<{ authenticated: boolean; user: AuthUser | null }>("/api/auth/me");
      if (meRes.authenticated && meRes.user) {
        return {
          success: true,
          token: "session_active",
          user: meRes.user,
          isNewDoctor: !meRes.user.doctorId,
        };
      }

      return {
        success: false,
      };
    } catch (error: any) {
      console.error("[Google Sign-In Error]:", error);
      throw error;
    }
  },
};
