/**
 * GraphQL fragment defining fields for gene sequence level.
 */
const geneSeqLevel: string = `
  gene { name length }
  mutations {
    text
    AAs
    unusualAAs
    reference
    position
    primaryType
    isApobecMutation
    hasStop
    isUnsequenced
    isUnusual
    isAmbiguous
    isDRM
    DRMDrugClass {
      name
      fullName
    }
    totalReads
    triplet
    allAAReads {
      aminoAcid
      numReads
      percent
    }
  }
`;

export {
  geneSeqLevel
};
