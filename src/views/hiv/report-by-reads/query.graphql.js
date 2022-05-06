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
      p95: percentile(p: 95)
    }
    availableGenes { name }
    bestMatchingSubtype {
      display
      referenceAccession
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
      unsequencedRegions {
        size
        regions {
          posStart posEnd
        }
      }
    }
  }
`;
