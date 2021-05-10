const rootLevel = `
  drdbLastUpdate(drdbVersion: $drdbVersion)
  antibodies(drdbVersion: $drdbVersion) {
    name
    abbrName
    priority
  }
`;

const pangolinQuery = `
  pangolin {
    version
    latestVersion
    loaded
    asyncResultsURI
    taxon
    lineage
    probability
    status
    note
  }
`;

const seqLevel = `
  mutationComments(cmtVersion: $cmtVersion) {
    triggeredMutations {
      gene { name }
      reference
      position
      isUnsequenced
      AAs
      text
    }
    version
    comment
  }
  antibodySuscSummary(drdbVersion: $drdbVersion) {
    itemsByMutations {
      mutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
      }
      hitVariants {
        displayName
      }
      variantMatchType
      numVariantOnlyMutations
      numQueryOnlyMutations
      references {
        refName
        DOI
        URL
      }
      items {
        reference { refName }
        rxName
        fold
      }
      itemsByAntibody {
        antibodies {
          name
          abbrName
          priority
        }
        cumulativeCount
        cumulativeFold {
          median: percentile(p: 50)
        } 
        references { refName }
        items {
          reference { refName }
          fold
        }
      }
    }
  }
  convPlasmaSuscSummary(drdbVersion: $drdbVersion) {
    itemsByMutations {
      mutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
      }
      hitVariants {
        displayName
      }
      variantMatchType
      numVariantOnlyMutations
      numQueryOnlyMutations
      references {
        refName
        DOI
        URL
      }
      cumulativeCount
      cumulativeFold {
        median: percentile(p: 50)
      }
      itemsByResistLevel {
        resistanceLevel
        cumulativeCount
      }
    }
  }
  vaccPlasmaSuscSummary(drdbVersion: $drdbVersion) {
    itemsByMutations {
      mutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
      }
      hitVariants {
        displayName
      }
      variantMatchType
      numVariantOnlyMutations
      numQueryOnlyMutations
      itemsByVaccine {
        vaccineName
        vaccinePriority
        vaccineType
        references {
          refName
          DOI
          URL
        }
        cumulativeCount
        cumulativeFold {
          median: percentile(p: 50)
        }
        itemsByResistLevel {
          resistanceLevel
          cumulativeCount
          itemsByVaccine {
            vaccineName
            cumulativeCount
          }
        }
      }
    }
  }
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
    allAAReads {
      aminoAcid
      numReads
      percent
    }
  }
`;

export {rootLevel, seqLevel, geneSeqLevel, pangolinQuery};
