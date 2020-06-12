import gql from 'graphql-tag.macro';

export const BestMatchingSubtype = gql`
  fragment BestMatchingSubtype on HIVBoundSubtype {
    display
    referenceAccession
  }
`;

export const Subtype = gql`
  fragment Subtypes on HIVBoundSubtype {
    displayWithoutDistance
    subtype { displayName }
    distancePcnt
    referenceAccession
    referenceCountry
    referenceYear
  }
`;

export const PrettyPairwise = gql`
  fragment PrettyPairwise on PrettyPairwise {
    positionLine refAALine alignedNAsLine mutationLine
  }
`;

export const SequenceSummary = gql`
  fragment SequenceSummary on SequenceAnalysis {
    bestMatchingSubtype {
      ...BestMatchingSubtype
    }
    subtypes: subtypesV2(first: 10) {
      ...Subtype
    }
    availableGenes { name }
    alignedGeneSequences {
      firstAA lastAA
      gene { name }
      sdrms: mutations(filterOptions: [SDRM]) {
        text
      }
      prettyPairwise {
        ...PrettyPairwise
      }
    }
  }
  ${BestMatchingSubtype}
  ${Subtype}
  ${PrettyPairwise}
`;

export const ValidationResult = gql`
  fragment ValidationResult on ValidationResult {
    level message
  }
`;

export const QAChart = gql`
  fragment QAChart on AlignedGeneSequence {
    firstAA
    lastAA
    gene { name length }
    mutations {
      text
      position
      primaryType
      isApobecMutation
      hasStop
      isUnsequenced
      isUnusual
      isAmbiguous
    }
    frameShifts {
      text
      position
      isInsertion
      isDeletion
    }
  }
`;

export const DRInterpretation = gql`
  fragment DRInterpretation on DrugResistance {
    gene {
       name,
       drugClasses { name fullName }
    }
    levels: drugScores {
      drugClass { name }
      drug { name displayAbbr fullName }
      text
    }
    mutationsByTypes {
      mutationType
      mutations { text isUnsequenced }
    }
    commentsByTypes {
      commentType
      comments {
        name
        text
        highlightText
      }
    }
  }
`;

export const DRMutationScores = gql`
  fragment DRMutationScores on DrugResistance {
    gene {
       name,
       drugClasses { name }
    }
    drugScores {
      drugClass { name }
      drug { name displayAbbr }
      score
      partialScores {
        mutations { text }
        score
      }
    }
  }
`;
