import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";

export function useTransactions(page = 1, limit = 50, filters = {}) {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...filters
        });
        const result = await fetchApi(`/transactions?${queryParams}`);
        if (isMounted) setData(result);
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => { isMounted = false; };
  }, [fetchApi, page, limit, JSON.stringify(filters)]);

  return { data, loading, error };
}
