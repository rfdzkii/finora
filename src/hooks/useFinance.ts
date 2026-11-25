import { useCallback, useEffect, useState } from 'react';
import type { AppData } from '../models/types';
import { LocalStorageRepository, STORAGE_KEY } from '../services/repository';
type State = { data: AppData | null; error: string | null };
export function useFinance() {
  const [state, setState] = useState<State>({ data: null, error: null });
  const reload = useCallback(() => {
    try { setState({ data: new LocalStorageRepository(window.localStorage).load(), error: null }); }
    catch (e) { setState({ data: null, error: e instanceof Error ? e.message : 'Unable to read storage.' }); }
  }, []);
  useEffect(() => {
    reload();
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) reload(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [reload]);
  const commit = useCallback((update: (current: AppData) => AppData) => {
    if (!state.data) throw new Error('Data is not available.');
    const next = new LocalStorageRepository(window.localStorage).save(update(state.data), state.data.revision);
    setState({ data: next, error: null });
  }, [state.data]);
  return { ...state, commit, reload };
}
