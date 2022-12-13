import gql from 'graphql-tag';
import {
  geneSeqLevel
} from '../common-query.graphql';

export default gql`
  fragment ReportBySequences on SequenceAnalysis {
    inputSequence { header }
    strain { name display }
    availableGenes { name }
    validationResults {
      level
      message
    }
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
      frameShifts {
        text
        position
        isInsertion
        isDeletion
      }
    }
  }
`;
