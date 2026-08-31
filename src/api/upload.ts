import { DEFAULT_API_BASE_URL } from "./client";
import { useAuthStore } from "../store/useAuthStore";

export const uploadApi = {
  uploadFile: async (
    fileUri: string,
    filePrefix: string = "doctor-profile"
  ): Promise<string> => {
    const token = useAuthStore.getState().token;

    // Determine extension and MIME type
    const rawExt = fileUri.split(".").pop()?.toLowerCase() || "jpg";
    const ext = rawExt === "jpeg" ? "jpg" : rawExt;
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "webp"
        ? "image/webp"
        : ext === "pdf"
        ? "application/pdf"
        : "image/jpeg";
    const filename = `${filePrefix}-${Date.now()}.${ext}`;

    // Read local file as blob
    const fileResponse = await fetch(fileUri);
    const blob = await fileResponse.blob();

    const uploadUrl = `${DEFAULT_API_BASE_URL}/api/upload?filename=${encodeURIComponent(
      filename
    )}`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": mime,
        ...(token && token !== "session_active"
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      body: blob,
    });

    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Upload failed. Please try again.");
    }

    return data.secure_url || data.url;
  },
};
