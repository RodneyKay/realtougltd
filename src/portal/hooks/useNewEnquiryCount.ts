import { useCallback, useEffect, useState } from 'react';
import { fetchNewEnquiryCount } from '../lib/portalApi';

/** Number of unread enquiries for the sidebar badge; refreshes on focus, on a timer and when the inbox changes. */
export function useNewEnquiryCount(agencyId: string | undefined) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!agencyId) return;
    fetchNewEnquiryCount(agencyId)
      .then(setCount)
      .catch(() => undefined);
  }, [agencyId]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    window.addEventListener('realto:enquiries-changed', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('realto:enquiries-changed', refresh);
    };
  }, [refresh]);

  return count;
}
