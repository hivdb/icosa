import React from 'react';

import style from './style.module.scss';


export default class BasicLink extends React.Component {

  render() {
    const {children, ...props} = this.props;
    return (
      <a {...props} className={style.link}>
        {children}
      </a>
    );
  }

}
