import React from 'react';
import classNames from 'classnames';

import style from './style.module.scss';

const ClassNameContext = React.createContext<string | null>(null);

export interface IntroHeaderProps {
  children: React.ReactNode;
}

export function IntroHeader({children}: IntroHeaderProps) {
  return <header>{children}</header>;
}

export interface IntroHeaderSupplementProps {
  children: React.ReactNode;
}

export function IntroHeaderSupplement({children}: IntroHeaderSupplementProps) {
  const parentClassName = React.useContext(ClassNameContext);
  const className = classNames(
    style.supplement,
    parentClassName ? `${parentClassName}-supplement` : null
  );

  return <div className={className}>{children}</div>;
}

export interface IntroProps {
  className?: string;
  children: React.ReactNode | React.ReactNode[];
}

export default function Intro({className, children}: IntroProps) {
  let header: React.ReactNode = null;
  let body: React.ReactNode[] = [];
  if (!(children instanceof Array)) {
    children = [children];
  }
  for (const element of children) {
    if (element && (element as any).type === IntroHeader) {
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

