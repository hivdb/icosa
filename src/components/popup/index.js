import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactJSPopup from 'reactjs-popup';

import style from './style.module.scss';


const POSITION_NEXT = {
  'top': 'right',
  'right': 'bottom',
  'bottom': 'left',
  'left': 'top'
};


HoverPopup.propTypes = {
  noUnderline: PropTypes.bool,
  children: PropTypes.node.isRequired,
  message: PropTypes.node,
  delay: PropTypes.number,
  position: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  className: PropTypes.string
};

HoverPopup.defaultProps = {
  noUnderline: false,
  delay: 100,
  position: 'top'
};

export function HoverPopup({
  noUnderline,
  children,
  delay,
  position,
  message,
  className
}) {
  const classNameArr = className ? className.split(/\s+/) : [];
  classNameArr.push(style['icosa-popup']);

  const positions = React.useMemo(
    () => {
      let curPos = position;
      const positions = [];
      for (let i = 0; i < 4; i ++) {
        positions.push(`${curPos} center`);
        curPos = POSITION_NEXT[curPos];
      }
      return positions;
    },
    [position]
  );

  if (!message) {
    return children;
  }
  else {
    return (
      <ReactJSPopup
       on="hover"
       mouseEnterDelay={delay}
       position={positions}
       className={classNames(...classNameArr)}
       closeOnDocumentClick
       keepTooltipInside
       repositionOnResize
       trigger={(
         <span
          data-no-underline={noUnderline ? '' : undefined}
          className={classNames(
            ...classNameArr.map(kls => `${kls}-trigger`)
          )}>
           {children}
         </span>
       )}>
        {message}
      </ReactJSPopup>
    );
  }
}
