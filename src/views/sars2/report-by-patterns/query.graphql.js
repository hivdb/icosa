import gql from 'graphql-tag';

export default gql`
  fragment HIVDBReportByPattern on MutationsAnalysis {
    name
    validationResults {
      level
      message
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
      hitMutations {
        position
      }
      hitPositions {
        position
      }
      itemsByAntibody {
        antibodies {
          name
          abbrName
          synonyms
          availability
          target
          antibodyClass
        }
        items {
          resistanceLevel
          cumulativeCount
          items {
            reference {
              refName
              DOI
              URL
            }
            assay
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
            }
            antibodies { name }
            section
            foldCmp
            fold
            ineffective
            cumulativeCount
          }
        }
      }
    }
    allGeneMutations {
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