const rootLevel = `
  drdbLastUpdate(drdbVersion: $drdbVersion)
  antibodies(drdbVersion: $drdbVersion) {
    name
    abbrName
    priority
  }
`;

function pangolinQuery(syncFetch = false) {
  return `
  pangolin(syncFetch: ${syncFetch}) {
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
}

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
    itemsByVariantOrMutations {
      variant {
        name
        asWildtype
      }
      mutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
      }
      variantMatchingMutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
      }
      variantExtraMutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
      }
      variantMissingMutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
      }
      isolateMatchType
      displayOrder
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
    itemsByVariantOrMutations {
      variant {
        name
        asWildtype
      }
      mutations {
        gene { name }
        reference
        position
        isUnsequenced
        isDRM
        AAs
        text
      }
      isolateMatchType
      displayOrder
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
    itemsByVariantOrMutations {
      variant {
        name
        asWildtype
      }
      mutations {
        gene { name }
        reference
        position
        isUnsequenced
        isDRM
        AAs
        text
      }
      isolateMatchType
      displayOrder
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
    totalReads
    triplet
    allAAReads {
      aminoAcid
      numReads
      percent
    }
  }
`;

export {rootLevel, seqLevel, geneSeqLevel, pangolinQuery};
