const BASE_URL = import.meta.env.VITE_API_URL || "";

export class APIError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  
  const headers: Record<string, string> = {};
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers[key] = value as string;
    });
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: "An unknown error occurred" };
    }
    let message = response.statusText;
    if (errorData && errorData.error) {
      if (Array.isArray(errorData.error.details)) {
        message = errorData.error.details
          .map((d: any) => {
            const field = d.loc ? d.loc[d.loc.length - 1] : "";
            const formattedField = field ? field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ") : "";
            return formattedField ? `${formattedField}: ${d.msg}` : d.msg;
          })
          .join(", ");
      } else {
        message = errorData.error.message || message;
      }
    } else if (errorData.detail) {
      message = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
    } else if (errorData.message) {
      message = errorData.message;
    }
    throw new APIError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),
    
  post: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  patch: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  put: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
