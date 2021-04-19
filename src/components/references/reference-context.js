import React from 'react';
import PromiseComponent from '../../utils/promise-component';

class ReferenceObject {

  constructor({
    references,
    setRef,
    refNames,
    pushRefName,
    refDataLoader
  }) {
    this.references = references;
    this._setRef = setRef;
    this.refNames = refNames;
    this._pushRefName = pushRefName;
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

  setLoaded = () => {
    if (process.env.NODE_ENV !== 'production') {
      if (this.loaded) {
        console.error(
          'Warning: refDataLoader should be only called once ' +
          'but is called multiple times.'
        );
      }
    }
    this.loaded = true;
    this._resolveLoadingPromise();
  }

  ensureLoaded = (callback, placeholder) => (
    <PromiseComponent
     promise={this._loadingPromise}
     then={() => callback(this)}>
      {placeholder}
    </PromiseComponent>
  )

  setReference = (name, reference, incr) => {
    let isNew = true;
    let payload = {name, _count: 0};
    const nameKey = name.toLocaleLowerCase();
    if (nameKey in this.references) {
      isNew = false;
      payload = this.references[nameKey];
    }
    else {
      // add new reference
      this._pushRefName(nameKey);
    }
    payload = {...payload, ...reference};
    if (incr) {
      payload._count ++;
    }
    if (isNew || Object.keys(reference).length > 0 || incr) {
      this._setRef({
        refName: nameKey,
        ref: payload
      });
    }
    const refNumber = this.refNames.indexOf(nameKey) + 1;
    const refLinkNumber = payload._count;
    return {
      number: refNumber,
      itemId: `${refNumber}_${nameKey}`,
      linkId: `${refNumber}_${nameKey}_${refLinkNumber}`
    };
  }

  hasAnyReference = () => {
    return this.getAllReferences().some(({linkIds}) => linkIds.length > 0);
  }

  getReference = (name) => {
    return this.references[name.toLocaleLowerCase()];
  }

  getAllReferences = () => {
    return this.refNames.map((nameKey, rn0) => {
      const {_count, ...ref} = this.references[nameKey];
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
  }

  getLinkedReferences = () => {
    return this.getAllReferences()
      .filter(({linkIds}) => linkIds.length > 0);
  }
}


export function useReference(refDataLoader) {
  const [references, setRef] = React.useReducer(
    (refs, {refName, ref}) => {
      refs[refName] = ref;
      return refs;
    },
    {}
  );
  const [refNames, pushRefName] = React.useReducer(
    (refNames, refName) => {
      if (!refNames.includes(refName)) {
        refNames.push(refName);
      }
      return refNames;
    },
    []
  );
  return new ReferenceObject({
    references, setRef,
    refNames, pushRefName,
    refDataLoader
  });
}


export default React.createContext({});
