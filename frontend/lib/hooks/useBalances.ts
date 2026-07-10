import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";

export function useBalances(accountId?: string) {
  const { fetchApi } = useApi();
  const [balanceData, setBalanceData] = useState<{ balance: number, label: string } | null>(null);
  const [netPositionData, setNetPositionData] = useState<{ net_position: number, bank_balance: number, manual_balance: number, accounts_breakdown?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        if (accountId && accountId !== 'all') {
          const result = await fetchApi(`/balance/overall?account_id=${accountId}`);
          if (isMounted) {
            setBalanceData(result);
            setNetPositionData(null);
          }
        } else {
          const result = await fetchApi(`/balance/net-position`);
          if (isMounted) {
            setNetPositionData(result);
            setBalanceData(null);
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, [fetchApi, accountId]);

  return { balanceData, netPositionData, loading, error };
}
