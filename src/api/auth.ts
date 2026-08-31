import { apiClient, DEFAULT_API_BASE_URL } from "./client";
import { AuthUser } from "../types/auth";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Initialize native Google Sign-In SDK with webClientId matching backend OAuth config
GoogleSignin.configure({
  webClientId: "2168852668-lsch9inl04ve35b7dlporipv0m9oe9hj.apps.googleusercontent.com",
  offlineAccess: false,
  forceCodeForRefreshToken: false,
});

export const authApi = {
  /**
   * Hydrate identity & doctor role from Bearer token
   * GET /api/auth/me
   */
  getMe: async (): Promise<{ authenticated: boolean; user: AuthUser | null }> => {
    return apiClient("/api/auth/me");
  },

  /**
   * 100% Native Google Sign-In for Doctors
   * Uses native Google Play Services bottom-sheet account picker and sends idToken
   * to POST /api/auth/mobile/google. Zero WebBrowsers, zero cookies, zero redirect URL schemes.
   */
  signInWithGoogle: async (): Promise<{
    success: boolean;
    cancelled?: boolean;
    token?: string;
    user?: AuthUser;
    isNewDoctor?: boolean;
    error?: string;
  }> => {
    try {
      // 1. Ensure Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Always clear cached session so the account chooser dialog is shown every time
      try {
        await GoogleSignin.signOut();
      } catch (_) {}

      // 2. Open native Android Google account picker
      const response = await GoogleSignin.signIn();

      // Extract idToken across GoogleSignin SDK versions
      const idToken = response.data?.idToken || (response as any).idToken;

      if (!idToken) {
        throw new Error("No Google ID token returned by Google Play Services.");
      }

      console.log("[Native Auth] Acquired Google ID token, calling /api/auth/mobile/google...");

      // 3. Send idToken directly to dedicated backend endpoint for cryptographic verification
      const verifyRes = await fetch(`${DEFAULT_API_BASE_URL}/api/auth/mobile/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await verifyRes.json().catch(() => ({}));

      if (!verifyRes.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Authentication failed on server. Please try again.",
        };
      }

      return {
        success: true,
        token: data.token,
        user: data.user,
        isNewDoctor: data.isNewDoctor,
      };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("[Native Auth] User dismissed Google account picker");
        return { success: false, cancelled: true };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { success: false, error: "Sign-in already in progress." };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: "Google Play Services is not available or outdated on this device.",
        };
      } else {
        console.error("[Native Google Sign-In Error]:", error);
        return {
          success: false,
          error: error.message || "Failed to complete Google sign-in.",
        };
      }
    }
  },

  /**
   * Native Sign Out
   */
  signOut: async (): Promise<void> => {
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Ignore if not signed in
    }
  },
};
