import { useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function useApi() {
  const supabase = createClient();

  const fetchApi = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const headers = new Headers(options.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      // If passing FormData, do NOT set Content-Type (browser will set it with boundary)
      if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMsg = "API Request Failed";
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (e) {
          errorMsg = response.statusText;
        }
        throw new Error(errorMsg);
      }

      return response.json();
    },
    [supabase.auth]
  );

  return { fetchApi };
}
