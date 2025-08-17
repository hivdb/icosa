import gql from 'graphql-tag';
import type {DocumentNode} from 'graphql';
import {
  seqLevel,
  geneSeqLevel
} from '../common-query.graphql';

const query: DocumentNode = gql`
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

export default query;

