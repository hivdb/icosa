import React from 'react';
import makeClassNames from 'classnames';

import style from './style.module.scss';

export interface BasicTOCProps {
  children?: React.ReactNode;
  className?: string;
}

export default function BasicTOC({children, className}: BasicTOCProps) {
  return (
    <div className={makeClassNames(style['toc-container'], className)}>
      <nav id="_toc" className={style.toc}>
        {children}
      </nav>
    </div>
  );
}

export interface AutoTOCProps {
  children: React.ReactNode;
  className?: string;
}

export function AutoTOC({children, className}: AutoTOCProps) {
  const childrenRef = React.useRef<HTMLDivElement>(null);
  const [tocArray, setTocArray] = React.useState<[string, HTMLElement][]>([]);

  const getTocArray = React.useCallback((headers: NodeListOf<Element>) => {
    const tocChildren: [string, HTMLElement][] = [];
    headers.forEach(header => {
      tocChildren.push([header.tagName.toLowerCase(), header as HTMLElement]);
    });
    return tocChildren;
  }, []);

  React.useEffect(() => {
    if (childrenRef.current) {
      const headers = childrenRef.current.querySelectorAll('h1,h2,h3,h4,h5,h6');
      setTocArray(getTocArray(headers));
    }
  }, [children, getTocArray]);

  function tocDom(
    elem: HTMLElement,
    subtocArray: [string, HTMLElement][],
    domList: React.ReactNode[]
  ) {
    const {id, textContent} = elem;
    const link = <a href={`#${id}`}>{textContent}</a>;
    domList.push(
      <li key={domList.length}>
        {link}
        {tocArrayToDom(subtocArray)}
      </li>
    );
  }

  function tocArrayToDom(array: [string, HTMLElement][]): React.ReactNode {
    if (array.length === 0) {
      return;
    }
    let [curLevel, curElem] = array.shift()!;
    const domList: React.ReactNode[] = [];
    let subtocArray: [string, HTMLElement][] = [];
    while (array.length > 0) {
      const [level, elem] = array.shift()!;
      if (level === curLevel) {
        tocDom(curElem, subtocArray, domList);
        curElem = elem;
        subtocArray = [];
      }
      else {
        subtocArray.push([level, elem]);
      }
    }
    tocDom(curElem, subtocArray, domList);
    if (domList.length > 0) {
      return <ul>{domList}</ul>;
    }
  }

  return (
    <>
      <BasicTOC className={className}>
        {tocArrayToDom([...tocArray])}
      </BasicTOC>
      <div ref={childrenRef}>{children}</div>
    </>
  );
}
