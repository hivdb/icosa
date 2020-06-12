import React from 'react';

import style from './style.module.scss';


export default class ExternalLink extends React.Component {

  render() {
    const {children, ...props} = this.props;
    return (
      <a
       target="_blank" rel="noopener noreferrer"
       {...props} className={style.link}>
        {children}
      </a>
    );
  }

}
