import gql from 'graphql-tag';

export default gql`
  fragment ReportByPatternRoot on Root {
    antibodies(drdbVersion: $drdbVersion) {
      name
      abbrName
      priority
    }
  }
  fragment ReportByPattern on MutationsAnalysis {
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
