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
   * Native Google OAuth Sign-In for Doctors
   * Uses backend /api/auth/mobile-start in-browser bridge to ensure NextAuth session cookies
   * and callbackUrl are established directly in the browser's cookie jar.
   */
  signInWithGoogle: async (): Promise<{
    success: boolean;
    token?: string;
    user?: AuthUser;
    isNewDoctor?: boolean;
  }> => {
    try {
      // 1. Create redirect URI for native mobile return
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "jivnicare-doctor",
        path: "auth-callback",
      });

      // 2. Open dedicated mobile OAuth bridge in native auth browser
      const authUrl = `${DEFAULT_API_BASE_URL}/api/auth/mobile-start?flow=doctor&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;

      console.log("[OAuth] Opening mobile-start bridge in browser:", authUrl);
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log("[OAuth] Browser Session Result:", result.type);

      if (result.type === "success" && result.url) {
        console.log("[OAuth] Deep-link captured successfully:", result.url);
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

      return {
        success: false,
      };
    } catch (error: any) {
      console.error("[Google Sign-In Error]:", error);
      throw error;
    }
  },
};
