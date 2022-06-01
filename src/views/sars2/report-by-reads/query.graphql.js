import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevelMutComments,
  seqLevelSuscSummary,
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
    }
    validationResults {
      level
      message
    }
    ${seqLevelMutComments}
    ${seqLevelSuscSummary}
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
