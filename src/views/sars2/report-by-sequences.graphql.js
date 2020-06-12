import gql from 'graphql-tag.macro';

export default gql`
  fragment HIVDBReportBySequences on SequenceAnalysis {
    inputSequence { header }
    strain { name display }
    bestMatchingSubtype {
      display
      referenceAccession
    }
    subtypes: subtypesV2(first: 10) {
      displayWithoutDistance
      subtype { displayName }
      distancePcnt
      referenceAccession
      referenceCountry
      referenceYear
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
