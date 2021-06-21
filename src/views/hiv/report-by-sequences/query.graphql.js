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
    validationResults {
      level
      message
    }
    ${seqLevel}
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
