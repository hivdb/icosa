import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevel,
  geneSeqLevel,
  pangolinQuery
} from '../common-query.graphql';

export default gql`
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
    assembledConsensus
    assembledUnambiguousConsensus
    allGeneSequenceReads {
      firstAA
      lastAA
      ${geneSeqLevel}
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
    }
  }
`;
