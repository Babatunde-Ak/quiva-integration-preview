'use client';

/**
 * Real sales and volume figures for a set of comics.
 *
 * The marketplace table used to show the comic's view count in its Sales column and a value
 * picked at random from a hard-coded list as its 24h volume. These come from completed purchase
 * records instead: `sales` is every successful purchase, `volume` only those inside the window.
 *
 * One request covers the whole table rather than one per row.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '@/config/api';

export interface ComicMarketStats {
  sales: number;
  volume: number;
}

type StatsRow = {
  comicId?: string;
  sales?: number;
  volume?: number;
};

export function useComicMarketStats(comicIds: string[], windowHours = 24) {
  const [stats, setStats] = useState<Record<string, ComicMarketStats>>({});
  const [isLoading, setIsLoading] = useState(false);

  // The caller rebuilds this array every render, so key the effect on the ids themselves.
  const idKey = useMemo(() => comicIds.filter(Boolean).join(','), [comicIds]);

  const refresh = useCallback(async () => {
    if (!idKey) {
      setStats({});
      return;
    }

    setIsLoading(true);

    try {
      const query = new URLSearchParams({
        comicIds: idKey,
        windowHours: String(windowHours),
      });

      const response = await fetch(
        `/api/quiva${API_ENDPOINTS.transactions.comicStats}?${query.toString()}`,
        { cache: 'no-store' }
      );

      if (!response.ok) throw new Error('Unable to load marketplace stats.');

      const body = await response.json();
      const rows: StatsRow[] = Array.isArray(body?.data) ? body.data : [];

      const next: Record<string, ComicMarketStats> = {};
      for (const row of rows) {
        if (!row?.comicId) continue;
        next[row.comicId] = {
          sales: Number(row.sales) || 0,
          volume: Number(row.volume) || 0,
        };
      }

      setStats(next);
    } catch (error) {
      // A missing figure shows as a dash, which is honest. Showing an invented number is not.
      console.warn('Could not load comic market stats:', error);
      setStats({});
    } finally {
      setIsLoading(false);
    }
  }, [idKey, windowHours]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, isLoading, refresh };
}

export default useComicMarketStats;
