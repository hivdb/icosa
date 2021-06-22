const rootLevel = `
  currentVersion {
    display
  }
`;

const seqLevel = `
  drugResistance {
    algorithm {
      text
      family
      version
      publishDate
    }
    gene {
       name,
       drugClasses { name fullName }
    }
    levels: drugScores {
      drugClass { name }
      drug { name displayAbbr fullName }
      text
    }
    mutationsByTypes {
      mutationType
      mutations { text isUnsequenced }
    }
    commentsByTypes {
      commentType
      comments {
        name
        text
        highlightText
      }
    }
    drugScores {
      drugClass { name }
      drug { name displayAbbr }
      score
      partialScores {
        mutations { text }
        score
      }
    }
  }
`;

const geneSeqLevel = `
  gene { name length }
  mutations {
    text
    AAs
    reference
    position
    primaryType
    isApobecMutation
    hasStop
    isUnsequenced
    isUnusual
    isAmbiguous
    isDRM
    totalReads
    triplet
    allAAReads {
      aminoAcid
      numReads
      percent
    }
  }
`;

export {rootLevel, seqLevel, geneSeqLevel};
