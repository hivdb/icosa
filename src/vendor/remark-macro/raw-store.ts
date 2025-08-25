/**
 * Runtime store for preserving complex macro props across the mdast -> hast -> React
 * pipeline where attribute values may be coerced to strings. We avoid JSON
 * serialization so ReactNodes or rich objects can be retained. Uses
 * FinalizationRegistry, when available, to clean up entries once associated
 * render objects are garbage collected.
 */

const store = new Map<string, any>();

/** Generate a unique id for storing raw props. */
function genId(): string {
  return `mrp_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

// Attempt to use FinalizationRegistry for automatic cleanup
const registry: FinalizationRegistry<string> | null = (typeof FinalizationRegistry !== 'undefined')
  ? new FinalizationRegistry((id: string) => {
      console.log(id);
      store.delete(id);
    })
  : null;

/**
 * Attach raw props to a given target object (typically the hProperties object
 * created during transformation). When the target is garbage collected, the
 * entry will be removed from the store.
 */
export function attachRawProps(target: object, obj: any): string {
  const id = genId();
  store.set(id, obj);
  try {
    registry?.register(target as object, id);
  } catch (_e) {
    // Ignore if registration fails; manual clear functions remain available
  }
  return id;
}

/** Backward-compat: store an object and return its id without registration. */
export function putRawProps(obj: any): string {
  const id = genId();
  store.set(id, obj);
  return id;
}

export function getRawProps(id?: string | null): any | undefined {
  if (!id) return undefined;
  return store.get(id);
}

export function clearRawProps(id?: string): void {
  if (id) store.delete(id);
}

export function clearAll(): void {
  store.clear();
}

export default { attachRawProps, putRawProps, getRawProps, clearRawProps, clearAll };
