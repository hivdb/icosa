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

  # TODO: hivalg only
  algorithmComparison(
    algorithms: $algorithms,
    customAlgorithms: $customAlgorithms
  ) {
    drugClass { name }
    drugScores {
      drug { name displayAbbr }
      algorithm
      SIR
      interpretation
      explanation
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
      }
    }
    drugScores {
      drugClass { name }
      drug { name displayAbbr }
      score
      level
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

export {rootLevel, seqLevel, geneSeqLevel};
