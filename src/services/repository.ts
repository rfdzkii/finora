import { emptyData } from '../models/defaults';
import type { AppData, DataRepository } from '../models/types';
import { validateData, parseBackup } from './validation';
export const STORAGE_KEY = 'finora:data:v1';
export class LocalStorageRepository implements DataRepository {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'>) {}
  load(): AppData {
    const raw = this.storage.getItem(STORAGE_KEY);
    return raw === null ? emptyData() : parseBackup(raw);
  }
  save(data: AppData, expectedRevision: number): AppData {
    const current = this.load();
    if (current.revision !== expectedRevision) throw new Error('Data changed in another tab. Reload before saving.');
    if (!Number.isSafeInteger(expectedRevision + 1)) throw new Error('Storage revision limit reached.');
    const validated = validateData({ ...data, revision: expectedRevision + 1 });
    try { this.storage.setItem(STORAGE_KEY, JSON.stringify(validated)); }
    catch { throw new Error('Could not save. Browser storage may be full or unavailable. No changes were committed.'); }
    return validated;
  }
}
export class MemoryRepository implements DataRepository {
  private data: AppData;
  constructor(initial: AppData = emptyData()) { this.data = validateData(initial); }
  load(): AppData { return structuredClone(this.data); }
  save(data: AppData, expectedRevision: number): AppData {
    if (this.data.revision !== expectedRevision) throw new Error('Stale revision.');
    this.data = validateData({ ...data, revision: expectedRevision + 1 });
    return this.load();
  }
}
