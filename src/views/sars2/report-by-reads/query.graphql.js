import gql from 'graphql-tag';
import {
  query as seqReadsSummaryFragment
} from '../../../components/report/seqreads-summary';
import {
  query as mutStatsFragment
} from '../../../components/report/mutation-stats';
import {
  query as extCodonFragment
} from '../../../components/report/seqreads-qa';

import {includeFragment} from '../../../utils/graphql-helper';

export default gql`
  fragment HIVDBReportBySequenceReadsRoot on Root {
    ${includeFragment(seqReadsSummaryFragment, 'Root')}
  }

  fragment HIVDBReportBySequenceReads on SequenceReadsAnalysis {
    name
    strain { display }
    pangolin {
      version
      latestVersion
      loaded
      asyncResultsURI
      taxon
      lineage
      probability
      status
      note
    }
    readDepthStats {
      median: percentile(p: 50)
    }
    validationResults {
      level
      message
    }
    availableGenes { name }
    minPrevalence
    minCodonReads
    minPositionReads
    ${includeFragment(seqReadsSummaryFragment, 'SequenceReadsAnalysis')}
    ${includeFragment(mutStatsFragment)}
    ${includeFragment(extCodonFragment)}
    allGeneSequenceReads {
      firstAA
      lastAA
      gene { name length }
      unsequencedRegions {
        size
        regions {
          posStart posEnd
        }
      }
      sdrms: mutations(filterOptions: [SDRM]) {
        text
      }
      # allPositionCodonReads {
      #   gene{
      #     name
      #   }
      #   position
      #   totalReads
      #   codonReads {
      #     codon
      #     reads
      #     aminoAcid
      #     prevalence
      #     isReference
      #     isApobecMutation
      #     isApobecDRM
      #     isUnusual
      #     isDRM
      #   }
      # }
      mutations {
        text
        position
        primaryType
        isApobecMutation
        hasStop
        isUnsequenced
        isUnusual
        isAmbiguous
        isDRM
      }
    }
    drugResistance {
      algorithm {
        text
        family
        version
        publishDate
      }
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
  }
  ${seqReadsSummaryFragment}
  ${mutStatsFragment}
  ${extCodonFragment}
`;
