import gql from 'graphql-tag.macro';

export default gql`
  fragment TabularReportBySequences_Root on Root {
    allGenes: genes {
      name
      refSequence
      length
    }
  }
  fragment TabularReportBySequences on SequenceAnalysis {
    inputSequence { header }
    availableGenes { name }
    mixturePcnt
    alignedGeneSequences {
      firstAA
      lastAA
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
        isUnusual
      }
      frameShifts {
        text
      }
    }
    drugResistance {
      gene { name }
      commentsByTypes {
        commentType
        comments {
          text
          boundMutation {
            text
          }
        }
      }
    }
  }
`;
