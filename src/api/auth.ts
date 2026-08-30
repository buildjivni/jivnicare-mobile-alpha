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
   * Native Google OAuth Sign-In for Doctors (Direct NextAuth Google Provider Integration)
   * Obtains authorization URL via NextAuth CSRF + POST /signin/google and launches native browser
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

      // 2. Fetch NextAuth CSRF token
      const csrfRes = await fetch(`${DEFAULT_API_BASE_URL}/api/auth/csrf`);
      const csrfData = await csrfRes.json().catch(() => ({}));
      const rawCookies = csrfRes.headers.get("set-cookie") || "";

      if (!csrfData?.csrfToken) {
        throw new Error("Unable to initialize secure authentication session.");
      }

      // 3. Initiate Google OAuth via NextAuth POST endpoint to obtain direct Google consent URL
      const callbackUrl = `/api/auth/session-callback?flow=doctor&client=mobile&redirect_uri=${encodeURIComponent(redirectUri)}`;
      const formData = new URLSearchParams();
      formData.append("csrfToken", csrfData.csrfToken);
      formData.append("callbackUrl", callbackUrl);
      formData.append("json", "true");

      const signinRes = await fetch(`${DEFAULT_API_BASE_URL}/api/auth/signin/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(rawCookies ? { Cookie: rawCookies } : {}),
        },
        body: formData.toString(),
      });

      const signinData = await signinRes.json().catch(() => ({}));
      const googleAuthUrl = signinData?.url;

      if (!googleAuthUrl) {
        throw new Error("Could not retrieve Google authorization URL.");
      }

      console.log("[OAuth] Launching Google Auth URL directly in browser...");
      const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUri);
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
