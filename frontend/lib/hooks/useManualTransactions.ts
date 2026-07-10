import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";

export function useManualTransactions(filters = {}) {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters as Record<string, string>);
      const result = await fetchApi(`/manual-transactions?${queryParams}`);
      setData(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fetchApi, JSON.stringify(filters)]);

  const createTransaction = async (txData: any) => {
    const result = await fetchApi('/manual-transactions', {
      method: 'POST',
      body: JSON.stringify(txData),
    });
    // Optimistic or real reload
    await loadData();
    return result;
  };

  const updateTransaction = async (id: string, txData: any) => {
    const result = await fetchApi(`/manual-transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(txData),
    });
    await loadData();
    return result;
  };

  const deleteTransaction = async (id: string) => {
    await fetchApi(`/manual-transactions/${id}`, {
      method: 'DELETE',
    });
    await loadData();
  };

  return { data, loading, error, refetch: loadData, createTransaction, updateTransaction, deleteTransaction };
}
