import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevel,
  geneSeqLevel,
  pangolinQuery
} from '../common-query.graphql';

export default gql`
  fragment TabularReportBySequences_Root on Root {
    ${rootLevel}
    allGenes: genes {
      name
      refSequence
      length
    }
  }
  fragment TabularReportBySequences on SequenceAnalysis {
    inputSequence { header }
    bestMatchingSubtype {
      display
      referenceAccession
    }
    ${pangolinQuery()}
    availableGenes { name }
    mixtureRate
    mutationCount
    unusualMutationCount
    ${seqLevel}
    alignedGeneSequences {
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
      mutationCount
      unusualMutationCount
      frameShifts {
        text
      }
    }
  }
`;
