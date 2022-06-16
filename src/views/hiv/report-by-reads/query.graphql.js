import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevel,
  geneSeqLevel
} from '../common-query.graphql';


export default gql`
  fragment ReportBySequenceReadsRoot on Root {
    ${rootLevel}
  }

  fragment ReportBySequenceReads on SequenceReadsAnalysis {
    name
    strain { display }
    readDepthStats {
      median: percentile(p: 50)
    }
    availableGenes { name }
    bestMatchingSubtype {
      display
      referenceAccession
    }
    cutoffKeyPoints {
      mixtureRate
      minPrevalence
      isAboveMixtureRateThreshold
      isBelowMinPrevalenceThreshold
    }
    subtypes(first: 10) {
      displayWithoutDistance
      subtype { displayName }
      distancePcnt
      referenceAccession
      referenceCountry
      referenceYear
    }
    validationResults(includeGenes: $includeGenes) {
      level
      message
    }
    ${seqLevel}
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
