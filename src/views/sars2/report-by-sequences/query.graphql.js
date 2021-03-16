import gql from 'graphql-tag.macro';

export default gql`
  fragment SARS2ReportBySequences on SequenceAnalysis {
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
    antibodySuscSummary {
      mutations {
        reference
        position
        AAs
        text
      }
      hitMutations {
        position
      }
      itemsByAntibody {
        antibodies { name, abbrName }
        items {
          resistanceLevel
          cumulativeCount
          items {
            reference {
              refName
              DOI
              URL
              firstAuthor
              year
            }
            controlVirusStrain { name }
            virusStrain { name }
            section
            foldCmp
            fold
            ineffective
            cumulativeCount
          }
        }
      }
      itemsByAntibodyClass {
        antibodyClass
        items {
          resistanceLevel
          cumulativeCount
          items {
            reference {
              refName
              DOI
              URL
              firstAuthor
              year
            }
            antibodies { name }
            controlVirusStrain { name }
            virusStrain { name }
            section
            foldCmp
            fold
            ineffective
            cumulativeCount
            numHitMutations
            numMissMutations
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
