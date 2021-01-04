import React from 'react';

export class ReferenceContextValue {

  constructor(LoadReferences) {
    this.references = {};
    this.reference_names = [];
    this.LoadReferences = LoadReferences;
  }

  setReference = (name, reference, noIncr = false) => {
    let prevRefDef = {_count: 0};
    const nameKey = name.toLocaleLowerCase();
    if (nameKey in this.references) {
      prevRefDef = this.references[nameKey];
    }
    else {
      // add new reference
      this.reference_names.push(nameKey);
    }
    this.references[nameKey] = {
      ...prevRefDef,
      ...reference,
      name
    };
    if (!noIncr) {
      this.references[nameKey]._count ++;
    }
    const refNumber = this.reference_names.indexOf(nameKey) + 1;
    const refLinkNumber = this.references[nameKey]._count;
    return {
      number: refNumber,
      itemId: `${refNumber}_${nameKey}`,
      linkId: `${refNumber}_${nameKey}_${refLinkNumber}`
    };
  }

  hasReference = () => {
    return this.getReferences().some(({linkIds}) => linkIds.length > 0);
  }

  getReference = (name) => {
    return this.references[name.toLocaleLowerCase()];
  }

  getReferences = () => {
    return this.reference_names.map((nameKey, rn0) => {
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
    }).filter(({linkIds}) => linkIds.length > 0);
  }
}


export default React.createContext({});
