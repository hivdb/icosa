import gql from 'graphql-tag';
import {
  query as seqReadsSummaryFragment
} from '../../../components/report/seqreads-summary';
import {
  rootLevel,
  seqLevel,
  pangolinQuery,
  geneSeqLevel
} from '../common-query.graphql';

import {includeFragment} from '../../../utils/graphql-helper';

export default gql`
  fragment ReportBySequenceReadsRoot on Root {
    ${includeFragment(seqReadsSummaryFragment, 'Root')}
    ${rootLevel}
  }

  fragment ReportBySequenceReads on SequenceReadsAnalysis {
    name
    strain { display }
    ${pangolinQuery}
    readDepthStats {
      median: percentile(p: 50)
      p95: percentile(p: 95)
    }
    validationResults {
      level
      message
    }
    ${seqLevel}
    availableGenes { name }
    minPrevalence
    minCodonReads
    minPositionReads
    ${includeFragment(seqReadsSummaryFragment, 'SequenceReadsAnalysis')}
    allGeneSequenceReads {
      firstAA
      lastAA
      ${geneSeqLevel}
      unsequencedRegions {
        size
        regions {
          posStart posEnd
        }
      }
      sdrms: mutations(filterOptions: [SDRM]) {
        text
      }
    }
  }
  ${seqReadsSummaryFragment}
`;
