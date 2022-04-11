import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevelMutComments,
  seqLevelSuscSummary,
  geneSeqLevel,
  pangolinQuery
} from '../common-query.graphql';


export function getExtraParams(subOptions) {
  const fetchMutComments = subOptions.includes('Mutation comments');
  const extraParams = ['$drdbVersion: String!'];
  if (fetchMutComments) {
    extraParams.push('$cmtVersion: String!');
  }
  return extraParams.join(', ');
}


export default function getQuery(subOptions) {
  const fetchMutComments = subOptions.includes('Mutation comments');
  const fetchSuscSummary = subOptions.includes('Susceptibility summary');
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
      bestMatchingSubtype {
        display
        referenceAccession
      }
      ${pangolinQuery()}
      availableGenes { name }
      mixtureRate
      mutationCount
      unusualMutationCount
      ${fetchMutComments ? seqLevelMutComments : ''}
      ${fetchSuscSummary ? seqLevelSuscSummary : ''}
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
        unusualMutationCount
        frameShifts {
          text
        }
      }
    }
  `;
}
