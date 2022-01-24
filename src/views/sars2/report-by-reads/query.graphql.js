import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevel,
  pangolinQuery,
  geneSeqLevel
} from '../common-query.graphql';


export default gql`
  fragment ReportBySequenceReadsRoot on Root {
    ${rootLevel}
  }

  fragment ReportBySequenceReads on SequenceReadsAnalysis {
    name
    strain { display }
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
    ${pangolinQuery()}
    readDepthStats {
      median: percentile(p: 50)
      p95: percentile(p: 95)
    }
    validationResults {
      level
      message
    }
    ${seqLevel}
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
      unsequencedRegions {
        size
        regions {
          posStart posEnd
        }
      }
    }
  }
`;
