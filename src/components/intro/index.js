import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


IntroHeader.propTypes = {
  children: PropTypes.node.isRequired
};

export function IntroHeader({children}) {
  return <header>{children}</header>;
}


IntroHeaderSupplement.propTypes = {
  children: PropTypes.node.isRequired
};

export function IntroHeaderSupplement({children}) {
  return <div className={style.supplement}>{children}</div>;
}


Intro.propTypes = {
  children: PropTypes.node.isRequired
};

export default function Intro({children}) {
  let header = null;
  let body = [];
  if (!(children instanceof Array)) {
    children = [children];
  }
  for (const element of children) {
    if (element && element.type === IntroHeader) {
      header = element;
    }
    else {
      body.push(element);
    }
  }

  return (
    <div className={style.intro}>
      {header}
      {body.length > 0 ?
        <section>
          {body}
        </section> :
        null}
    </div>
  );
}
