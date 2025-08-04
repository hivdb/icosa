import gql from 'graphql-tag';
import type {DocumentNode} from 'graphql';
import {
  geneSeqLevel
} from '../common-query.graphql';

export function getExtraParams(): string {
  return '';
}

export default function getQuery(): DocumentNode {
  return gql`
    fragment TabularReportBySequences_Root on Root {
      allGenes: genes(names: $includeGenes) {
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
      bestMatchingSubtype {
        display
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

