import gql from 'graphql-tag';
import gql from 'graphql-tag';
import type {DocumentNode} from 'graphql';
import {geneSeqLevel} from '../common-query.graphql';

/** Extra parameters for sequence read queries. */
export function getExtraParams(): string {
  return '';
}

/**
 * Build GraphQL query for tabular sequence read reports.
 *
 * @param subOptions - Selected sub-options determining query fields.
 */
export default function getQuery(subOptions: string[]): DocumentNode {
  const fetchConsensus = (
    subOptions.includes('Consensus sequence (FASTA)') ||
    subOptions.includes('Raw JSON report')
  );
  return gql`
    fragment TabularReportBySeqReads_Root on Root {
      allGenes: genes {
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
      }
    }
  `;
}
