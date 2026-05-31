import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiGetCurrentSeason, apiGetSeasons, type Season } from '../services/seasonApi';

export const SELECTED_SEASON_STORAGE_KEY = 'vleague-selected-season-id';

function readStoredSeasonId(storageKey: string) {
  try {
    return window.sessionStorage.getItem(storageKey) ?? undefined;
  } catch (_err) {
    return undefined;
  }
}

function writeStoredSeasonId(storageKey: string, seasonId: string) {
  try {
    window.sessionStorage.setItem(storageKey, seasonId);
  } catch (_err) {
    // Ignore storage failures; the URL still carries the selected season.
  }
}

function parseTime(value?: string | null) {
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

export function getLatestSeason(seasons: Season[]) {
  return [...seasons].sort((a, b) => {
    const yearDiff = b.year - a.year;
    if (yearDiff !== 0) return yearDiff;
    const createdDiff = parseTime(b.createdAt) - parseTime(a.createdAt);
    if (createdDiff !== 0) return createdDiff;
    return b.name.localeCompare(a.name);
  })[0];
}

function resolveSeasonId(seasons: Season[], urlSeasonId?: string, storedSeasonId?: string) {
  if (seasons.length === 0) return undefined;

  const validSeasonIds = new Set(seasons.map((season) => season.id));
  const preferred = [urlSeasonId, storedSeasonId].find((seasonId): seasonId is string =>
    Boolean(seasonId && validSeasonIds.has(seasonId)),
  );

  return preferred ?? getLatestSeason(seasons)?.id;
}

export function useSeasonSelection(
  queryKey = 'seasonId',
  storageKey = SELECTED_SEASON_STORAGE_KEY,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonIdState] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const urlSeasonId = searchParams.get(queryKey) || undefined;

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([apiGetSeasons(), apiGetCurrentSeason()])
      .then(([seasonsResult, currentSeasonResult]) => {
        if (cancelled) return;

        const seasonList = seasonsResult.status === 'fulfilled' ? seasonsResult.value : [];
        const current =
          currentSeasonResult.status === 'fulfilled' ? currentSeasonResult.value : null;
        const normalizedSeasons =
          current && !seasonList.some((season) => season.id === current.id)
            ? [current, ...seasonList]
            : seasonList;

        setSeasons(normalizedSeasons);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedSeasonId = useMemo(() => {
    if (loading) return undefined;
    return resolveSeasonId(seasons, urlSeasonId, readStoredSeasonId(storageKey));
  }, [loading, seasons, storageKey, urlSeasonId]);

  useEffect(() => {
    if (loading) return;

    setSelectedSeasonIdState(resolvedSeasonId);

    if (!resolvedSeasonId) return;

    writeStoredSeasonId(storageKey, resolvedSeasonId);

    if (urlSeasonId !== resolvedSeasonId) {
      setSearchParams(
        (previousParams) => {
          const nextParams = new URLSearchParams(previousParams);
          nextParams.set(queryKey, resolvedSeasonId);
          return nextParams;
        },
        { replace: true },
      );
    }
  }, [loading, queryKey, resolvedSeasonId, setSearchParams, storageKey, urlSeasonId]);

  const setSelectedSeasonId = useCallback(
    (seasonId?: string) => {
      const nextSeasonId = seasonId ?? getLatestSeason(seasons)?.id;
      if (!nextSeasonId) return;

      setSelectedSeasonIdState(nextSeasonId);
      writeStoredSeasonId(storageKey, nextSeasonId);
      setSearchParams(
        (previousParams) => {
          const nextParams = new URLSearchParams(previousParams);
          nextParams.set(queryKey, nextSeasonId);
          return nextParams;
        },
        { replace: true },
      );
    },
    [queryKey, seasons, setSearchParams, storageKey],
  );

  const selectedSeason = useMemo(
    () => seasons.find((season) => season.id === selectedSeasonId),
    [seasons, selectedSeasonId],
  );

  return {
    loading,
    seasons,
    selectedSeason,
    selectedSeasonId,
    setSelectedSeasonId,
  };
}
