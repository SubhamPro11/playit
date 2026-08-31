import { useState, useCallback } from 'react';
import { Video, LinkHealthReport, HealthStatusType } from '../types/video';

const STORAGE_KEY = 'airwaves_link_health';
const LEGACY_STORAGE_KEY = 'playit_link_health';
const REPORTED_SESSION_KEY = 'airwaves_reported_broken_stations_v1';

export function useLinkHealth() {
  const [healthMap, setHealthMap] = useState<Record<string, LinkHealthReport>>(() => {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [reportedIds, setReportedIds] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem(REPORTED_SESSION_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // Save to localStorage when healthMap changes
  const saveHealthMap = useCallback((newMap: Record<string, LinkHealthReport>) => {
    setHealthMap(newMap);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
    } catch {
      // ignore
    }
  }, []);

  const hasReportedBroken = useCallback((id: string) => {
    return reportedIds.includes(id);
  }, [reportedIds]);

  const reportBrokenLink = useCallback((video: { id: string; externalLink: string }) => {
    if (reportedIds.includes(video.id)) return false;

    const newReported = [...reportedIds, video.id];
    setReportedIds(newReported);
    try {
      sessionStorage.setItem(REPORTED_SESSION_KEY, JSON.stringify(newReported));
    } catch {
      // ignore
    }

    const report: LinkHealthReport = {
      videoId: video.id,
      url: video.externalLink,
      status: 'broken',
      lastChecked: new Date().toISOString(),
      error: 'Reported by visitor',
    };

    setHealthMap((prev) => {
      const next = { ...prev, [video.id]: report };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    return true;
  }, [reportedIds]);

  // Check a single station link
  const checkSingleLink = useCallback(async (video: Video): Promise<LinkHealthReport> => {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    let status: HealthStatusType = 'live';
    let httpStatus: number | undefined;
    let error: string | undefined;

    try {
      // First attempt a no-cors HEAD/GET request
      // In browser JS, no-cors will succeed (opaque response) if the host DNS resolves and server returns response
      await fetch(video.externalLink, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store',
      });
      status = 'live';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        status = 'timeout';
        error = 'Request timed out after 7 seconds';
      } else {
        // Retry with GET no-cors before flagging broken
        try {
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), 7000);
          await fetch(video.externalLink, {
            method: 'GET',
            mode: 'no-cors',
            signal: retryController.signal,
            cache: 'no-store',
          });
          clearTimeout(retryTimeoutId);
          status = 'live';
        } catch (retryErr: any) {
          if (retryErr.name === 'AbortError') {
            status = 'timeout';
            error = 'Connection timed out';
          } else {
            status = 'broken';
            error = retryErr?.message || 'Network unreachable or connection failed';
          }
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }

    const responseTimeMs = Date.now() - startTime;
    const report: LinkHealthReport = {
      videoId: video.id,
      url: video.externalLink,
      status,
      httpStatus,
      lastChecked: new Date().toISOString(),
      responseTimeMs,
      error,
    };

    setHealthMap((prev) => {
      const next = { ...prev, [video.id]: report };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    return report;
  }, []);

  // Batch check all stations with concurrency limit
  const checkAllLinks = useCallback(async (videos: Video[]) => {
    if (videos.length === 0 || isCheckingAll) return;

    setIsCheckingAll(true);
    setProgress({ current: 0, total: videos.length });

    const updatedMap: Record<string, LinkHealthReport> = { ...healthMap };
    const concurrency = 4;
    let index = 0;

    const worker = async () => {
      while (index < videos.length) {
        const currentIndex = index++;
        const video = videos[currentIndex];
        if (!video) break;

        const report = await checkSingleLink(video);
        updatedMap[video.id] = report;

        setProgress((prev) => ({
          ...prev,
          current: Math.min(prev.current + 1, videos.length),
        }));
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, videos.length) }, () => worker());
    await Promise.all(workers);

    saveHealthMap(updatedMap);
    setIsCheckingAll(false);
  }, [checkSingleLink, healthMap, isCheckingAll, saveHealthMap]);

  const clearHealthData = useCallback(() => {
    setHealthMap({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    healthMap,
    isCheckingAll,
    progress,
    checkSingleLink,
    checkAllLinks,
    clearHealthData,
    reportBrokenLink,
    hasReportedBroken,
  };
}
