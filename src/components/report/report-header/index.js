import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


function HLFirstWord({children, index}) {
  children = children.split(' ');
  return <>
    <h1>{index + 1}. {children[0]}</h1>
    {children.length > 1 ? (
      <p className={style.desc}>{children.slice(1).join(' ')}</p>
    ) : null}
  </>;
}


function ReportHeader({
  output,
  name,
  index,
  onObserve,
  onDisconnect
}) {
  const headerRef = React.useRef();

  React.useEffect(
    () => {
      if (output === 'printable') {
        return;
      }
      const headerNode = headerRef.current;
      const payload = {
        name,
        index,
        node: headerNode
      };
      onObserve(payload);
      return () => onDisconnect(payload);
    },
    [output, headerRef, name, index, onObserve, onDisconnect]
  );

  return <header
   ref={headerRef}
   className={style['report-header']} id={name}>
    <HLFirstWord index={index}>{name}</HLFirstWord>
  </header>;
}


ReportHeader.propTypes = {
  output: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onObserve: PropTypes.func.isRequired
};


export default React.memo(
  ReportHeader,
  (prev, next) => (
    prev.output === next.output &&
    prev.name === next.name &&
    prev.index === next.index &&
    prev.onObserve === next.onObserve
  )
);
