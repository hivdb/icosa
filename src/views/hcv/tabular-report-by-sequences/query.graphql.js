import gql from 'graphql-tag';
import {geneSeqLevel} from '../common-query.graphql';

export default gql`
  fragment HCVTabularReportRoot on Root {
    allGenes: genes(names: $includeGenes) {
      name
      refSequence
      length
    }
  }
  fragment HCVTabularReport on SequenceAnalysis {
    inputSequence { header }
    strain { name display }
    availableGenes { name }
    bestMatchingSubtype { display referenceAccession }
    subtypes: subtypesV2(first: 10) {
      displayWithoutDistance
      subtype { displayName }
      distancePcnt
    }
    validationResults(includeGenes: $includeGenes) { level message }
    alignedGeneSequences(includeGenes: $includeGenes) {
      firstAA
      lastAA
      ${geneSeqLevel}
      mutations {
        displayAAs
        isInsertion
        isDeletion
      }
      unsequencedRegions {
        size
        regions { posStart posEnd }
      }
      prettyPairwise {
        positionLine
        refAALine
        alignedNAsLine
        mutationLine
      }
      frameShifts { text position isInsertion isDeletion }
    }
  }
`;
