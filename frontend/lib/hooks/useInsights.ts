import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";

export function useInsights(statementId?: string) {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      setLoading(true);
      try {
        const endpoint = statementId ? `/insights?statement_id=${statementId}` : "/insights";
        const result = await fetchApi(endpoint);
        if (isMounted) setData(result);
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => { isMounted = false; };
  }, [fetchApi, statementId]);

  return { data, loading, error };
}
