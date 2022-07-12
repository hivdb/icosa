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


export default function getQuery(subOptions) {
  const fetchConsensus = (
    subOptions.includes('Consensus sequence (FASTA)') ||
    subOptions.includes('raw JSON report')
  );
  return gql`
    fragment TabularReportBySeqReads_Root on Root {
      ${rootLevel}
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
    fragment TabularReportBySeqReads on SequenceReadsAnalysis {
      name
      ${seqLevel}
      bestMatchingSubtype {
        display
        distance
        referenceAccession
      }
      readDepthStats {
        median: percentile(p: 50)
      }
      availableGenes { name }
      mixtureRate
      maxMixtureRate
      actualMinPrevalence
      minPrevalence
      minPositionReads
      mutations(
        filterOptions: [SEQUENCED_ONLY],
        includeGenes: $includeGenes
      ) { gene { name } text position }
      unusualMutations: mutations(
        filterOptions: [SEQUENCED_ONLY, UNUSUAL],
        includeGenes: $includeGenes
      ) { gene { name } text position }
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
      ${fetchConsensus ? `
        assembledConsensus
        assembledUnambiguousConsensus
      ` : ''}
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
}
