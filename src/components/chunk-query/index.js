import React from 'react';
import PropTypes from 'prop-types';
import {Query} from 'react-apollo';

import ChunkQueryInner from './inner';

export default class ChunkQuery extends React.Component {

  static propTypes = {
    render: PropTypes.func.isRequired,
    query: PropTypes.object.isRequired,
    onRequireVariables: PropTypes.func.isRequired,
    onMergeData: PropTypes.func.isRequired,
    renderPartialResults: PropTypes.bool.isRequired,
    noVariablesMessage: PropTypes.node.isRequired,
    progressText: PropTypes.func.isRequired,
    noCache: PropTypes.bool.isRequired
  }

  static defaultProps = {
    noCache: false,
    renderPartialResults: false,
    onMergeData: prev => prev,
    progressText: () => null,
    noVariablesMessage: <div>No input data supplied.</div>
  }

  handleLoadMore(fetchMore, data) {
    const {onMergeData, onRequireVariables} = this.props;
    return () => {
      const {
        variables, progress, nextProgress, total, done
      } = onRequireVariables(data);
      if (done) { return [true, progress, nextProgress, total]; }
      fetchMore({
        variables,
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return onMergeData(prev, fetchMoreResult);
        }
      });
      return [false, progress, nextProgress, total];
    };
  }

  render() {
    const {
      query, render, onRequireVariables, progressText, client,
      noVariablesMessage, renderPartialResults, noCache} = this.props;
    const {variables, done} = onRequireVariables();
    const fetchPolicy = noCache ? 'no-cache' : 'cache-first';
    if (done) { return noVariablesMessage; }
    return (
      <Query {...{query, variables, fetchPolicy, client}} returnPartialData>
        {({loading, error, data, fetchMore}) => (
          <ChunkQueryInner
           key="chunk-query-inner"
           {...{
             data, render, renderPartialResults,
             progressText, loading, error
           }}
           onLoadMore={this.handleLoadMore(fetchMore, data)} />
        )}
      </Query>
    );
  }

}
