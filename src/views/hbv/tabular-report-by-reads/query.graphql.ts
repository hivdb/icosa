import gql from 'graphql-tag';
import type {DocumentNode} from 'graphql';
import {geneSeqLevel} from '../common-query.graphql';

export function getExtraParams(): string {
  return '';
}

export default function getQuery(subOptions: string[]): DocumentNode {
  const fetchConsensus = (
    subOptions.includes('Consensus sequence (FASTA)') ||
    subOptions.includes('Raw JSON report')
  );
  return gql`
    fragment TabularReportBySeqReads_Root on Root {
      allGenes: genes(names: $includeGenes) {
        name
        refSequence
        length
      }
    }
    fragment TabularReportBySeqReads on SequenceReadsAnalysis {
      name
      readDepthStats {
        median: percentile(p: 50)
      }
      availableGenes { name }
      bestMatchingSubtype {
        display
      }
      mixtureRate
      maxMixtureRate
      actualMinPrevalence
      minPrevalence
      minCodonReads
      minPositionReads
      mutationCount
      ${fetchConsensus ? `
        assembledConsensus
        assembledUnambiguousConsensus
      ` : ''}
      allGeneSequenceReads(includeGenes: $includeGenes) {
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
      }
    }
  `;
}

