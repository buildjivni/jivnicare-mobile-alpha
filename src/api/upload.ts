import * as FileSystem from "expo-file-system";
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

    const uploadUrl = `${DEFAULT_API_BASE_URL}/api/upload?filename=${encodeURIComponent(
      filename
    )}`;

    const response = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        "Content-Type": mime,
        ...(token && token !== "session_active"
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
    });

    if (response.status < 200 || response.status >= 300) {
      let errorMsg = `Upload failed (${response.status})`;
      try {
        const errObj = JSON.parse(response.body);
        if (errObj.error) errorMsg = errObj.error;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    const data = JSON.parse(response.body);
    if (!data.url) {
      throw new Error("No URL returned from upload server.");
    }

    return data.secure_url || data.url;
  },
};
