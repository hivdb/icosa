import gql from 'graphql-tag';
import type {DocumentNode} from 'graphql';
import {
  geneSeqLevel
} from '../common-query.graphql';

const query: DocumentNode = gql`
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

export default query;
