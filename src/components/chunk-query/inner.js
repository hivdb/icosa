import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader';

import SmoothProgressBar from './smooth-progress-bar';
import style from './style.scss';


export default class ChunkQueryInner extends React.Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired,
    renderPartialResults: PropTypes.bool.isRequired,
    onLoadMore: PropTypes.func.isRequired,
    progressText: PropTypes.func.isRequired
  }

  render() {
    const {
      data, render, renderPartialResults,
      progressText, onLoadMore} = this.props;
    const [done, progress, nextProgress, total] = onLoadMore();
    const renderResults = renderPartialResults || done;
    return <>
      <Loader loaded={done} />
      <SmoothProgressBar
       loaded={done}
       className={style.progressBar}
       {...{progress, nextProgress, total, progressText}} />
      {renderResults ? render(data, data === undefined, done) : null}
    </>;
  }

}
