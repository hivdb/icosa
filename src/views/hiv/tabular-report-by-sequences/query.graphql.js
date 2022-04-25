import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevel,
  geneSeqLevel
} from '../common-query.graphql';

export function getExtraParams(/* subOptions */) {
  return '';
}

export default function getQuery(/* subOptions */) {
  return gql`
    fragment TabularReportBySequences_Root on Root {
      ${rootLevel}
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
      ${seqLevel}
      alignedGeneSequences {
        firstAA
        lastAA
        ${geneSeqLevel}
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
        frameShifts {
          text
        }
      }
    }
  `;
}
