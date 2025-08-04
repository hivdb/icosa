/**
 * GraphQL fragments defining fields for sequence and gene level data.
 */
const seqLevel: string = `
  drugResistance {
    algorithm {
      text
      family
      version
      publishDate
    }
    gene {
       name
       drugClasses { name fullName }
    }
    levels: drugScores {
      drugClass { name }
      drug { name displayAbbr fullName }
      text
    }
    mutationsByTypes {
      drugClass { name }
      mutationType
      mutations {
        text
        AAs
        reference
        position
        isUnusual
        isApobecMutation
        isApobecDRM
        isDRM
        DRMDrugClass {
          name
          fullName
        }
        isUnsequenced
        totalReads
        allAAReads {
          aminoAcid
          numReads
          percent
        }
      }
    }
    commentsByTypes {
      commentType
      comments {
        name
        text
        highlightText
        boundMutation { position text }
      }
    }
  }
`;

/** GraphQL fragment describing gene sequence level fields. */
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
  seqLevel,
  geneSeqLevel
};

