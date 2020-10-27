import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader';

import SmoothProgressBar from './smooth-progress-bar';
import style from './style.module.scss';


export default class ChunkQueryInner extends React.Component {

  static propTypes = {
    data: PropTypes.object,
    render: PropTypes.func.isRequired,
    renderPartialResults: PropTypes.bool.isRequired,
    onLoadMore: PropTypes.func.isRequired,
    progressText: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.shape({
      message: PropTypes.string.isRequired
    })
  }

  render() {
    const {
      data, render, renderPartialResults,
      progressText, onLoadMore, loading, error} = this.props;
    let progressbar = null;
    let done = !loading;
    if (error) {
      return `Error! ${error.message}`;
    }
    if (!loading) {
      const [_done, progress, nextProgress, total] = onLoadMore();
      done = _done;
      progressbar = (
        <SmoothProgressBar
         loaded={done}
         className={style['progress-bar']}
         {...{progress, nextProgress, total, progressText}} />
      );
    }
    const renderResults = renderPartialResults || done;
    return <>
      <Loader loaded={done} />
      {progressbar}
      {renderResults ? render(data, data === undefined, done) : null}
    </>;
  }

}
