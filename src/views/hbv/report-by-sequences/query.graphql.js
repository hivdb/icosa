import gql from 'graphql-tag';
import {
  geneSeqLevel
} from '../common-query.graphql';

export default gql`
  fragment ReportBySequences on SequenceAnalysis {
    inputSequence { header }
    strain { name display }
    availableGenes { name }
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
    validationResults(includeGenes: $includeGenes) {
      level
      message
    }
    alignedGeneSequences(includeGenes: $includeGenes) {
      firstAA
      lastAA
      ${geneSeqLevel}
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
      frameShifts {
        text
        position
        isInsertion
        isDeletion
      }
    }
  }
`;
