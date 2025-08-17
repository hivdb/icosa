import gql from 'graphql-tag';
import {rootLevel, seqLevel, geneSeqLevel} from '../common-query.graphql';

/**
 * GraphQL fragments for the pattern analysis report.
 */
export default gql`
  fragment ReportByPatternRoot on Root {
    ${rootLevel}
  }
  fragment ReportByPattern on MutationsAnalysis {
    name
    validationResults {
      level
      message
    }
    ${seqLevel}
    allGeneMutations {
      ${geneSeqLevel}
    }
  }
`;
