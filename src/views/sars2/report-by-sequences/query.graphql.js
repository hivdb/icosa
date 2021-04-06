import gql from 'graphql-tag.macro';

export default gql`
  fragment ReportBySequencesRoot on Root {
    antibodies(drdbVersion: $drdbVersion) {
      name
      abbrName
      priority
    }
  }
  fragment ReportBySequences on SequenceAnalysis {
    inputSequence { header }
    strain { name display }
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
    availableGenes { name }
    validationResults {
      level
      message
    }
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
      mutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
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
        items {
          reference {
            refName
            DOI
            URL
          }
        }
      }
    }
    alignedGeneSequences {
      firstAA
      lastAA
      gene { name length }
      unsequencedRegions {
        size
        regions {
          posStart posEnd
        }
      }
      prettyPairwise {
        positionLine
        refAALine
        alignedNAsLine
        mutationLine
      }
      sdrms: mutations(filterOptions: [SDRM]) {
        text
      }
      mutations {
        text
        position
        reference
        AAs
        primaryType
        isApobecMutation
        hasStop
        isUnsequenced
        isUnusual
        isAmbiguous
        isDRM
      }
      frameShifts {
        text
        position
        isInsertion
        isDeletion
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
  }
`;
