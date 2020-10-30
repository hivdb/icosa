import React from 'react';
import Loader from 'react-loader';

import SmoothProgressBar from './smooth-progress-bar';
import style from './style.module.scss';


export default function ChunkQueryInner(props) {

  const {
    data, render, renderPartialResults,
    progressText, onLoadMore, loading, error} = props;
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
