import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from './style.module.scss';


const ClassNameContext = React.createContext(null);


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
  const parentClassName = React.useContext(ClassNameContext);
  const className = classNames(
    style.supplement,
    parentClassName ? `${parentClassName}-supplement` : null
  );

  return <div className={className}>{children}</div>;
}


Intro.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default function Intro({className, children}) {
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

  return <ClassNameContext.Provider value={className}>
    <div className={classNames(className, style.intro)}>
      {header}
      {body.length > 0 ?
        <section>
          {body}
        </section> :
        null}
    </div>
  </ClassNameContext.Provider>;
}
