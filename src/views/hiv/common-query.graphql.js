const rootLevel = `
  currentVersion {
    display
  }

  # TODO: hivseq only
  mutationPrevalenceSubtypes {
    name
    stats(includeGenes: $includeGenes) {
      gene {name}
      totalNaive
      totalTreated
    }
  }
`;

const seqLevel = `

  # TODO: hivseq only
  mutationPrevalences(includeGenes: $includeGenes) {
    boundMutation {
      gene {name}
      text
      position
      reference
      triplet
    }
    matched {
      AA
      subtypes {
        subtype {name}
        percentageNaive
        percentageTreated
      }
    }
    others {
      AA
      subtypes {
        subtype {name}
        percentageNaive
        percentageTreated
      }
    }
  }

  drugResistance(includeGenes: $includeGenes) {
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
      mutationType
      mutations {
        text
        AAs
        reference
        position
        isUnusual
        isUnsequenced
      }
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
