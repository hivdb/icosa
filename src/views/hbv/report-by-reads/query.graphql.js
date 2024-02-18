import gql from 'graphql-tag';
import {
  geneSeqLevel
} from '../common-query.graphql';


export default gql`
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
    validationResults(includeGenes: $includeGenes) {
      level
      message
    }
    bestMatchingSubtype {
      display
      referenceAccession
    }
    subtypes: subtypes(first: 10) {
      displayWithoutDistance
      subtype { displayName }
      distancePcnt
      referenceAccession
      referenceCountry
      referenceYear
    }
    availableGenes { name }
    mixtureRate
    maxMixtureRate
    actualMinPrevalence
    minPrevalence
    minCodonReads
    minPositionReads
    assembledConsensus
    allGeneSequenceReads(includeGenes: $includeGenes) {
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
