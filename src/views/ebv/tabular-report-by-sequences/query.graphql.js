import gql from 'graphql-tag';
import {
  geneSeqLevel
} from '../common-query.graphql';


export function getExtraParams() {
  return '';
}


export default function getQuery() {
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
