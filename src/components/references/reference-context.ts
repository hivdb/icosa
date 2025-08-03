import React from 'react';
import isEqual from 'lodash/isEqual';
import PromiseComponent from '../../utils/promise-component';

/**
 * Maintains a collection of reference objects and provides helper methods
 * for components to register and retrieve bibliographic references.
 */
class ReferenceObject {
  // private fields
  #references: Record<string, any>;
  #refNames: string[];
  #onUpdates: Array<() => void>;

  // public fields
  refDataLoader?: React.ComponentType<any>;
  loaded: boolean;
  private _loadingPromise: Promise<void>;
  private _resolveLoadingPromise!: () => void;

  constructor({ refDataLoader }: { refDataLoader?: React.ComponentType<any> }) {
    this.#references = {};
    this.#refNames = [];
    this.#onUpdates = [];
    this.refDataLoader = refDataLoader;

    // default to loaded if refDataLoader is not provided
    this.loaded = !refDataLoader;
    this._loadingPromise = new Promise(resolve => {
      this._resolveLoadingPromise = resolve;
      if (this.loaded) {
        resolve();
      }
    });
  }

  /** Register a callback that fires when references are updated. */
  listenOnUpdate = (cb: () => void) => {
    if (!this.#onUpdates.includes(cb)) {
      this.#onUpdates.push(cb);
    }
  };

  /** Mark the reference data as loaded. */
  setLoaded = () => {
    this.loaded = true;
    this._resolveLoadingPromise();
  };

  /**
   * Ensure that reference data has been loaded before rendering.
   * Renders a placeholder until the promise resolves.
   */
  ensureLoaded = (
    callback: (ctx: ReferenceObject) => React.ReactNode,
    placeholder: React.ReactNode
  ): React.ReactNode => (
    <PromiseComponent
      promise={this._loadingPromise}
      then={() => callback(this)}>
      {placeholder}
    </PromiseComponent>
  );

  /**
   * Store a reference object and optionally increment the reference count.
   * Returns an identifier object used for linking.
   */
  setReference = (
    name: string,
    reference: Record<string, any>,
    incr: boolean
  ) => {
    let isNew = true;
    let prevPayload,
      payload: any = { name, _count: 0 };
    const nameKey = name.toLocaleLowerCase();
    if (nameKey in this.#references) {
      isNew = false;
      prevPayload = payload = this.#references[nameKey];
    } else {
      this.#refNames.push(nameKey);
    }
    payload = { ...payload, ...reference };
    if (incr) {
      payload._count++;
    }
    if (isNew || incr || !isEqual(prevPayload, payload)) {
      this.#references[nameKey] = payload;
      for (const cb of this.#onUpdates) {
        cb();
      }
    }
    const refNumber = this.#refNames.indexOf(nameKey) + 1;
    const refLinkNumber = payload._count;
    return {
      number: refNumber,
      itemId: `${refNumber}_${nameKey}`,
      linkId: `${refNumber}_${nameKey}_${refLinkNumber}`
    };
  };

  /**
   * Returns true if any references have been stored. When `includeInlines`
   * is false, only references with links are considered.
   */
  hasAnyReference = (includeInlines = false): boolean => {
    if (includeInlines) {
      return !!Object.keys(this.#references).length;
    }
    return this.getAllReferences().some(({ linkIds }) => linkIds.length > 0);
  };

  /** Retrieve a stored reference by name. */
  getReference = (name: string) => {
    return this.#references[name.toLocaleLowerCase()];
  };

  /** Get all references in insertion order. */
  getAllReferences = () => {
    return this.#refNames.map((nameKey, rn0) => {
      const { _count, ...ref } = this.#references[nameKey];
      const refNumber = rn0 + 1;
      const linkIds = [] as string[];
      for (let rln = 1; rln <= _count; rln++) {
        linkIds.push(`${refNumber}_${nameKey}_${rln}`);
      }
      return {
        ...ref,
        number: refNumber,
        itemId: `${refNumber}_${nameKey}`,
        linkIds
      };
    });
  };

  /** Only return references that have at least one link. */
  getLinkedReferences = () => {
    return this.getAllReferences().filter(({ linkIds }) => linkIds.length > 0);
  };
}

/**
 * Hook that creates a memoised {@link ReferenceObject} instance.
 *
 * @param refDataLoader - Optional loader component
 * @param cacheKey - A key to reset the cache when changed
 */
export function useReference(
  refDataLoader?: React.ComponentType<any>,
  cacheKey?: unknown
) {
  // the purpose of cacheKey is for refreshing memoized ReferenceObject
  return React.useMemo(
    () => (cacheKey || !cacheKey ? new ReferenceObject({ refDataLoader }) : null),
    [refDataLoader, cacheKey]
  );
}

export default React.createContext<any>({});
