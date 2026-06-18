'use client';

import { useEffect, useState } from 'react';
import { Activity, Cloud, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/app/store';
import { Button } from '@/shared/ui';

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    userId,
    setUserId,
    checkHealth,
    isProgressLoading,
    isProgressSaving,
    syncError,
    healthStatus,
    lastRemoteSyncAt,
  } = useAppStore();
  const [draftUserId, setDraftUserId] = useState(userId);

  useEffect(() => {
    void useAppStore.getState().loadProgress();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-bg-surface/85 px-4 py-3 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">FS</div>
            <div>
              <p className="text-sm font-semibold text-text-primary">FSdev Roadmap</p>
              <p className="text-xs text-text-secondary">Next.js + OpenAI + MongoDB sync</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <form
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
              onSubmit={(event) => {
                event.preventDefault();
                void setUserId(draftUserId);
              }}
            >
              <label className="flex items-center gap-2 text-xs text-text-secondary">
                <Cloud className="h-4 w-4 text-accent" />
                Код синхронізації
              </label>
              <input
                value={draftUserId}
                onChange={(event) => setDraftUserId(event.target.value)}
                className="h-10 min-w-0 rounded-md border border-border bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted sm:w-56"
                placeholder="default"
              />
              <Button type="submit" className="bg-bg-elevated hover:bg-border-hover" loading={isProgressLoading}>
                <RefreshCw className="h-4 w-4" />
                Sync
              </Button>
              <Button type="button" className="bg-bg-elevated hover:bg-border-hover" onClick={() => void checkHealth()}>
                <Activity className="h-4 w-4" />
                API
              </Button>
            </form>
            <p className={`text-xs ${syncError ? 'text-red-300' : 'text-text-muted'}`}>
              {syncError
                ? `Sync error: ${syncError}`
                : healthStatus || (isProgressSaving ? 'Зберігаю прогрес...' : `Remote sync ${lastRemoteSyncAt ? `о ${lastRemoteSyncAt}` : 'ще не підтверджено'}`)}
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
