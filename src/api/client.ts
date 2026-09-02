import { useAuthStore } from "../store/useAuthStore";

// Real Live Production Backend Domain
export const DEFAULT_API_BASE_URL = "https://www.jinnicare.com";

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuthClear?: boolean;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, headers = {}, skipAuthClear = false, ...rest } = options;
  const token = useAuthStore.getState().token;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${DEFAULT_API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && token !== "session_active" ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  };

  if (options.body instanceof FormData) {
    delete requestHeaders["Content-Type"];
  }

  const method = options.method || "GET";
  console.log(`[API Request] ${method} ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`[API Response] ${response.status} ${url}`);

    if (response.status === 401) {
      if (!skipAuthClear && !endpoint.includes("/onboard") && !endpoint.includes("/public")) {
        useAuthStore.getState().clearAuth();
      }
      throw new ApiError("Session expired or authentication required. Please sign in with Google.", 401);
    }

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = json.error || json.message || `Request failed with status ${response.status}`;
      console.warn(`[API Error Response] ${url} ->`, message);
      throw new ApiError(message, response.status, json);
    }

    return json as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`[API Catch] ${url} ->`, error.message);
    if (error.name === "AbortError") {
      throw new ApiError("Request timed out. Please check your network connection.", 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || "Network request failed. Please check internet access.", 500);
  }
}
