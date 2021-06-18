import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevel,
  geneSeqLevel
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
    availableGenes { name }
    mixturePcnt
    maxMixturePcnt
    actualMinPrevalence
    minPrevalence
    minCodonReads
    minPositionReads
    assembledConsensus
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
