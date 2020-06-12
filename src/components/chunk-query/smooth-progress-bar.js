import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from 'react-progressbar';

import style from './style.scss';


export default class SmoothProgressBar extends React.Component {

  static propTypes = {
    loaded: PropTypes.bool.isRequired,
    progressText: PropTypes.func.isRequired,
    progress: PropTypes.number.isRequired,
    nextProgress: PropTypes.number.isRequired
  }

  constructor() {
    super(...arguments);
    const {progress, nextProgress} = this.props;
    this.state = {
      estProgress: progress,
      prevNextProgress: nextProgress,
      estInterval: 100,
      timeStart: new Date().getTime()
    };
    this._unmounted = false;
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  render() {
    const {
      loaded, nextProgress, progress,
      progressText, total, ...props} = this.props;
    if (loaded) {
      return null;
    }
    let {estProgress, prevNextProgress, estInterval, timeStart} = this.state;
    if (prevNextProgress < nextProgress) {
      estProgress = progress;
      estInterval = (new Date().getTime() - timeStart) / progress;
    }
    setTimeout(() => {
      if (!this._unmounted && estProgress < nextProgress) {
        this.setState({
          estProgress: estProgress + 1,
          prevNextProgress: nextProgress,
          estInterval
        });
      }
    }, estInterval);
    const completed = parseInt(estProgress / total * 100, 10);
    return <div className={style.progressBarContainer}>
      {progressText(estProgress, total)}
      <ProgressBar {...props} completed={completed} />
    </div>;
  }

}
