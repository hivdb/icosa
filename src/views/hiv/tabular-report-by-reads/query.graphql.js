import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevel,
  geneSeqLevel
} from '../common-query.graphql';


export function getExtraParams(/* subOptions */) {
  return '';
}


export default function getQuery(subOptions) {
  const fetchConsensus = subOptions.includes('Consensus sequence (FASTA)');
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
      ${seqLevel}
      bestMatchingSubtype {
        display
        referenceAccession
      }
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
