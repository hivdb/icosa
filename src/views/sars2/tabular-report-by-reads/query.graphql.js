import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevelMutComments,
  seqLevelSuscSummary,
  geneSeqLevel,
  pangolinQuery
} from '../common-query.graphql';


export function getExtraParams(subOptions) {
  const fetchMutComments = (
    subOptions.includes('Mutation comments') ||
    subOptions.includes('Raw JSON report')
  );
  const extraParams = ['$drdbVersion: String!'];
  if (fetchMutComments) {
    extraParams.push('$cmtVersion: String!');
  }
  return extraParams.join(', ');
}


export default function getQuery(subOptions) {
  const fetchConsensus = (
    subOptions.includes('Consensus sequence (FASTA)') ||
    subOptions.includes('Raw JSON report')
  );
  const fetchSuscSummary = (
    subOptions.includes('Susceptibility summary') ||
    subOptions.includes('Raw JSON report')
  );
  const fetchMutComments = (
    subOptions.includes('Mutation comments') ||
    subOptions.includes('Raw JSON report')
  );
  return gql`
    fragment TabularReportBySeqReads_Root on Root {
      ${rootLevel}
      allGenes: genes {
        name
        refSequence
        length
      }
    }
    fragment TabularReportBySeqReads on SequenceReadsAnalysis {
      name
      ${fetchMutComments ? seqLevelMutComments : ''}
      ${fetchSuscSummary ? seqLevelSuscSummary : ''}
      bestMatchingSubtype {
        display
        referenceAccession
      }
      ${pangolinQuery()}
      readDepthStats {
        median: percentile(p: 50)
      }
      availableGenes { name }
      mixtureRate
      maxMixtureRate
      actualMinPrevalence
      minPrevalence
      minCodonReads
      minPositionReads
      mutationCount
      unusualMutationCount
      ${fetchConsensus ? `
        assembledConsensus
        assembledUnambiguousConsensus
      ` : ''}
      allGeneSequenceReads {
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
      }
    }
  `;
}
