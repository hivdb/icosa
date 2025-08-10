import localforage from 'localforage';
import useSmartAsync from './use-smart-async';

/**
 * Determine whether a given key references a BigData record.
 *
 * @param key - The candidate key to check.
 * @returns `true` when the key matches the BigData prefix; otherwise `false`.
 */
export function isBigData(key: unknown): boolean {
  return typeof key === 'string' && key.startsWith('@@bigData/');
}

/**
 * Generate a random six-character key used for BigData storage.
 *
 * @returns Randomly generated key string.
 */
  function randomKey(): string {
    const key = Math.floor(Math.random() * 0x7fffffff).toString(36);
    return '000000'.slice(key.length) + key;
  }

/**
 * Load data from localforage when the key is a BigData key.
 *
 * @param key - Either a BigData key or an object containing the key.
 * @returns A promise that resolves to the stored value or the original key
 *          when the key does not represent BigData.
 */
async function load<T = unknown>(key: string | {key: string}): Promise<T | string> {
  if (typeof key === 'object' && 'key' in key) {
    key = key.key;
  }
  if (!isBigData(key)) {
    return key;
  }
  const data = await localforage.getItem<string>(key);
  return JSON.parse(data ?? 'null') as T;
}

/**
 * Persist arbitrary data to localforage using a generated BigData key.
 *
 * @param data - Serializable value to store.
 * @returns A promise resolving to the generated BigData key.
 */
async function save<T = unknown>(data: T): Promise<string> {
  const key = `@@bigData/${randomKey()}`;
  const serialized = JSON.stringify(data);
  await localforage.setItem(`*${key}`, Date.now());
  await localforage.setItem(key, serialized);
  return key;
}

/**
 * Remove a BigData entry from localforage.
 *
 * @param key - BigData key to remove.
 * @returns A promise that resolves when removal completes.
 */
async function remove(key: string): Promise<void> {
  if (!isBigData(key)) {
    return;
  }
  await localforage.removeItem(key);
  await localforage.removeItem(`*${key}`);
}

/**
 * Clear all expired BigData entries older than the provided timeout.
 *
 * @param timeout - Maximum age in milliseconds. Defaults to one hour.
 * @returns A promise that resolves when pruning completes.
 */
async function clear(timeout = 3600000): Promise<void> {
  const minTs = Date.now() - timeout;
  for (const key of await localforage.keys()) {
    if (typeof key === 'string' && isBigData(key)) {
      const ts = await localforage.getItem<number>(`*${key}`);
      if (ts != null && ts < minTs) {
        await remove(key);
      }
    }
  }
}

/**
 * React hook to asynchronously load BigData content.
 *
 * @param key - BigData key to load.
 * @returns Tuple containing the loaded data and a pending flag.
 */
function useBigData<T = unknown>(key: string): [T | undefined, boolean] {
  if (!key) {
    throw new Error('key is empty');
  }
    const {data, error, isPending} = useSmartAsync<T>({
      promiseFn: () => load<T>(key) as Promise<T>,
      key
    });
  if (error) {
    throw new Error(error.message);
  }
  return [data, isPending];
}

const BigData = {isBigData, load, save, remove, clear, use: useBigData};
export default BigData;
