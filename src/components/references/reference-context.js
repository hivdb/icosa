import React from 'react';
import isEqual from 'lodash/isEqual';
import PromiseComponent from '../../utils/promise-component';

class ReferenceObject {

  // private fields
  #references;
  #refNames;
  #onUpdates;

  // public fields
  refDataLoader;

  constructor({
    refDataLoader
  }) {
    this.#references = {};
    this.#refNames = [];
    this.#onUpdates = [];
    this.refDataLoader = refDataLoader;

    // default to loaded if refDataLoader is not provided
    this.loaded = !refDataLoader;
    this._loadingPromise = new Promise(
      resolve => {
        this._resolveLoadingPromise = resolve;
        if (this.loaded) {
          resolve();
        }
      }
    );
  }

  listenOnUpdate = cb => {
    if (!this.#onUpdates.includes(cb)) {
      this.#onUpdates.push(cb);
    }
  };

  setLoaded = () => {
    this.loaded = true;
    this._resolveLoadingPromise();
  };

  ensureLoaded = (callback, placeholder) => (
    <PromiseComponent
     promise={this._loadingPromise}
     then={() => callback(this)}>
      {placeholder}
    </PromiseComponent>
  );

  setReference = (name, reference, incr) => {
    let isNew = true;
    let prevPayload, payload = {name, _count: 0};
    const nameKey = name.toLocaleLowerCase();
    if (nameKey in this.#references) {
      isNew = false;
      prevPayload = payload = this.#references[nameKey];
    }
    else {
      this.#refNames.push(nameKey);
    }
    payload = {...payload, ...reference};
    if (incr) {
      payload._count ++;
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

  hasAnyReference = (includeInlines = false) => {
    if (includeInlines) {
      return !!Object.keys(this.#references).length;
    }
    return this.getAllReferences().some(({linkIds}) => linkIds.length > 0);
  };

  getReference = (name) => {
    return this.#references[name.toLocaleLowerCase()];
  };

  getAllReferences = () => {
    return this.#refNames.map((nameKey, rn0) => {
      const {_count, ...ref} = this.#references[nameKey];
      const refNumber = rn0 + 1;
      const linkIds = [];
      for (let rln = 1; rln <= _count; rln ++) {
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

  getLinkedReferences = () => {
    return this.getAllReferences()
      .filter(({linkIds}) => linkIds.length > 0);
  };
}


export function useReference(refDataLoader, cacheKey) {
  // the purpose of cacheKey is for refreshing memoized ReferenceObject
  return React.useMemo(
    () => cacheKey || !cacheKey ? new ReferenceObject({
      refDataLoader
    }) : null,
    [refDataLoader, cacheKey]
  );
}


export default React.createContext({});
