import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevel,
  geneSeqLevel
} from '../common-query.graphql';

export default gql`
  fragment ReportBySequencesRoot on Root {
    ${rootLevel}
  }
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
    ${seqLevel}
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
      sdrms: mutations(filterOptions: [SDRM]) {
        text
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
