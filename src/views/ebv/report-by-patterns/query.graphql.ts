import gql from 'graphql-tag';
import type {DocumentNode} from 'graphql';
import {
  geneSeqLevel
} from '../common-query.graphql';

const query: DocumentNode = gql`
  fragment ReportByPattern on MutationsAnalysis {
    name
    validationResults {
      level
      message
    }
    allGeneMutations {
      ${geneSeqLevel}
    }
  }
`;

export default query;
