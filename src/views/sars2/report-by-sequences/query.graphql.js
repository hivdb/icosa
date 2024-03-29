import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevelMutComments,
  seqLevelSuscSummary,
  pangolinQuery,
  geneSeqLevel
} from '../common-query.graphql';

export default gql`
  fragment ReportBySequencesRoot on Root {
    ${rootLevel}
  }
  fragment ReportBySequences on SequenceAnalysis {
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
    ${pangolinQuery()}
    availableGenes { name }
    validationResults(includeGenes: [_3CLpro, RdRP, S]) {
      level
      message
    }
    ${seqLevelMutComments}
    ${seqLevelSuscSummary}
    alignedGeneSequences {
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
