import gql from 'graphql-tag.macro';

/** GraphQL fragments used throughout report components. */

/** Fragment describing the best matching subtype. */
export const BestMatchingSubtype = gql`
  fragment BestMatchingSubtype on HIVBoundSubtype {
    display
    referenceAccession
  }
`;

/** Fragment listing subtype details. */
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

/** Fragment for pretty pairwise alignment. */
export const PrettyPairwise = gql`
  fragment PrettyPairwise on PrettyPairwise {
    positionLine refAALine alignedNAsLine mutationLine
  }
`;

/** Fragment summarising sequence details. */
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

/** Fragment describing validation results. */
export const ValidationResult = gql`
  fragment ValidationResult on ValidationResult {
    level message
  }
`;

/** Fragment defining QA chart data. */
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

/** Fragment outlining drug resistance interpretation. */
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

/** Fragment containing mutation score details. */
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
