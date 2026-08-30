import { apiClient } from "./client";

export const uploadApi = {
  uploadFile: async (fileUri: string, mimeType: string = "image/jpeg"): Promise<string> => {
    const formData = new FormData();
    const filename = fileUri.split("/").pop() || "upload.jpg";

    // React Native FormData format
    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);

    const response = await apiClient<{ success: boolean; url: string; secure_url?: string }>(
      "/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    return response.secure_url || response.url;
  },
};
