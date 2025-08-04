import gql from 'graphql-tag';
import type {DocumentNode} from 'graphql';
import {
  geneSeqLevel
} from '../common-query.graphql';

const query: DocumentNode = gql`
  fragment ReportBySequenceReads on SequenceReadsAnalysis {
    name
    strain { display }
    cutoffKeyPoints {
      mixtureRate
      minPrevalence
      isAboveMixtureRateThreshold
      isBelowMinPrevalenceThreshold
    }
    readDepthStats {
      median: percentile(p: 50)
      p95: percentile(p: 95)
    }
    validationResults {
      level
      message
    }
    availableGenes { name }
    mixtureRate
    maxMixtureRate
    actualMinPrevalence
    minPrevalence
    minCodonReads
    minPositionReads
    assembledConsensus
    allGeneSequenceReads {
      firstAA
      lastAA
      ${geneSeqLevel}
      readDepthStats {
        median: percentile(p: 50)
      }
      unsequencedRegions {
        size
        regions {
          posStart posEnd
        }
      }
    }
  }
`;

export default query;
