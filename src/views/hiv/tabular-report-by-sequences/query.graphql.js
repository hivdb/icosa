import gql from 'graphql-tag';
import {
  rootLevel,
  seqLevel,
  geneSeqLevel
} from '../common-query.graphql';


export function getExtraParams(/* subOptions */) {
  return `
    $includeGenes: [EnumGene!]!,
    $algorithms: [ASIAlgorithm!],
    $customAlgorithms: [CustomASIAlgorithm!]
  `;
}


export default function getQuery(/* subOptions */) {
  return gql`
    fragment TabularReportBySequences_Root on Root {
      ${rootLevel}
      currentVersion { family version publishDate }
      allGenes: genes(names: $includeGenes) {
        name
        refSequence
        length
        drugClasses {
          name
          hasSurveilDrugResistMutations
          hasRxSelectedMutations
          mutationTypes
          drugs {
            name
            fullName
            displayAbbr
          }
        }
      }
    }
    fragment TabularReportBySequences on SequenceAnalysis {
      inputSequence { header MD5 sequence }
      bestMatchingSubtype {
        display
        distance
        referenceAccession
      }
      availableGenes { name }
      mixtureRate
      mutations(
        filterOptions: [SEQUENCED_ONLY],
        includeGenes: $includeGenes
      ) { gene { name } text }
      unusualMutations: mutations(
        filterOptions: [SEQUENCED_ONLY, UNUSUAL],
        includeGenes: $includeGenes
      ) { gene { name } text }
      frameShifts(
        includeGenes: $includeGenes
      ) { gene { name } text position size }
      insertions: mutations(
        filterOptions: [SEQUENCED_ONLY, INSERTION],
        includeGenes: $includeGenes
      ) { gene { name } text position }
      deletions: mutations(
        filterOptions: [SEQUENCED_ONLY, DELETION],
        includeGenes: $includeGenes
      ) { gene { name } text position }
      stopCodons: mutations(
        filterOptions: [SEQUENCED_ONLY, STOPCODON],
        includeGenes: $includeGenes
      ) { gene { name } text position }
      ambiguousMutations: mutations(
        filterOptions: [SEQUENCED_ONLY, AMBIGUOUS],
        includeGenes: $includeGenes
      ) { gene { name } text position }
      apobecMutations: mutations(
        filterOptions: [SEQUENCED_ONLY, APOBEC],
        includeGenes: $includeGenes
      ) { gene { name } text position }
      ${seqLevel}
      alignedGeneSequences(includeGenes: $includeGenes) {
        firstAA
        lastAA
        alignedNAs
        alignedAAs
        ${geneSeqLevel}
        unsequencedRegions {
          size
          regions {
            posStart posEnd
          }
        }
        gene { name }
        sdrms: mutations(filterOptions: [SDRM]) {
          text
          SDRMDrugClass { name }
        }
        tsms: mutations(filterOptions: [TSM]) {
          text
          TSMDrugClass { name }
        }
        mutations {
          text
          reference
          position
          triplet
          displayAAs
          insertedNAs
          primaryType
          DRMDrugClass { name }
          isInsertion
          isDeletion
          hasStop
          isUnusual
          isApobecMutation
          isUnsequenced
          isAmbiguous
        }
      }
    }
  `;
}
