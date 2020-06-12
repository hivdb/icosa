import React from 'react';
import {Link as FoundLink} from 'found';

import style from './style.module.scss';


export default class Link extends React.Component {

  render() {
    const {children, ...props} = this.props;
    return (
      <FoundLink
       {...props} className={style.link}>
        {children}
      </FoundLink>
    );
  }

}
