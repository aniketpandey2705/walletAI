import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";

export function useAccounts() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const result = await fetchApi(`/accounts`);
      setData(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [fetchApi]);

  const createAccount = async (accountData: any) => {
    const result = await fetchApi('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
    await fetchAccounts();
    return result;
  };

  return { data, loading, error, refetch: fetchAccounts, createAccount };
}
