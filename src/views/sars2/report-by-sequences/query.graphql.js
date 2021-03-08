import gql from 'graphql-tag.macro';

export default gql`
  fragment SARS2ReportBySequences on SequenceAnalysis {
    inputSequence { header }
    strain { name display }
    bestMatchingSubtype {
      display
      referenceAccession
    }
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
    alignedGeneSequences {
      firstAA
      lastAA
      gene { name length }
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
