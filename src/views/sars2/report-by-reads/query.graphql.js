import gql from 'graphql-tag';
import {
  query as seqReadsSummaryFragment
} from '../../../components/report/seqreads-summary';

import {includeFragment} from '../../../utils/graphql-helper';

export default gql`
  fragment ReportBySequenceReadsRoot on Root {
    ${includeFragment(seqReadsSummaryFragment, 'Root')}
    antibodies(drdbVersion: $drdbVersion) {
      name
      abbrName
      priority
    }
  }

  fragment ReportBySequenceReads on SequenceReadsAnalysis {
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
      p95: percentile(p: 95)
    }
    validationResults {
      level
      message
    }
    mutationComments(cmtVersion: $cmtVersion) {
      triggeredMutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
      }
      version
      comment
    }
    antibodySuscSummary(drdbVersion: $drdbVersion) {
      mutations {
        gene { name }
        reference
        position
        isUnsequenced
        AAs
        text
      }
      itemsByAntibody {
        antibodies {
          name
          abbrName
          priority
        }
        cumulativeCount
        cumulativeFold {
          median: percentile(p: 50)
        } 
        items {
          reference {
            refName
            DOI
            URL
          }
        }
      }
    }
    availableGenes { name }
    minPrevalence
    minCodonReads
    minPositionReads
    ${includeFragment(seqReadsSummaryFragment, 'SequenceReadsAnalysis')}
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
        AAs
        reference
        position
        primaryType
        isApobecMutation
        hasStop
        isUnsequenced
        isUnusual
        isAmbiguous
        isDRM
        totalReads
        allAAReads {
          aminoAcid
          numReads
          percent
        }
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
`;
