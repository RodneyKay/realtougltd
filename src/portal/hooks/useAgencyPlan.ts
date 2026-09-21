import { useCallback, useEffect, useState } from 'react';
import { fetchPlanOverview, PlanOverview } from '../lib/portalApi';

/** Loads the agency's plan, limits and usage; call `refresh()` after anything that changes usage. */
export function useAgencyPlan(agencyId: string | undefined) {
  const [overview, setOverview] = useState<PlanOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!agencyId) return;
    try {
      setOverview(await fetchPlanOverview(agencyId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your plan.');
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { overview, loading, error, refresh };
}
