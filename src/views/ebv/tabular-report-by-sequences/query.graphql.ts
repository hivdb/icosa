import gql from 'graphql-tag';
import type {DocumentNode} from 'graphql';
import {geneSeqLevel} from '../common-query.graphql';

/** Extra parameters for sequence tabular report query. */
export function getExtraParams(): string {
  return '';
}

/** Build GraphQL query for tabular sequence reports. */
export default function getQuery(): DocumentNode {
  return gql`
    fragment TabularReportBySequences_Root on Root {
      allGenes: genes {
        name
        refSequence
        length
      }
    }
    fragment TabularReportBySequences on SequenceAnalysis {
      inputSequence { header }
      availableGenes { name }
      mixtureRate
      mutationCount
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
        gene { name }
        mutations {
          text
          position
          displayAAs
          primaryType
          isInsertion
          isDeletion
          hasStop
          isUnsequenced
          isAmbiguous
        }
        mutationCount
        frameShifts {
          text
        }
      }
    }
  `;
}
