import React from 'react';
import classNames from 'classnames';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';

import style from './style.module.scss';

interface ReportSectionProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  collapsable?: boolean;
  display?: boolean;
  toggleDisplay?: () => void;
  title: string;
  titleAnnotation?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Generic wrapper for report sections with optional collapse behaviour.
 */
export default function ReportSection({
  className,
  collapsable = false,
  display = true,
  toggleDisplay = () => null,
  title,
  titleAnnotation,
  children,
  ...props
}: ReportSectionProps) {
  return (
    <section
      {...props}
      className={classNames(style['report-section'], className)}
      data-display={display}
    >
      <h2>
        {collapsable ? (
          <button onClick={toggleDisplay} className={style['toggle-display']}>
            {display ? <FaRegMinusSquare /> : <FaRegPlusSquare />}
          </button>
        ) : null}
        {title}
      </h2>
      {titleAnnotation ? (
        <div className={style['header-annotation']}>{titleAnnotation}</div>
      ) : null}
      {collapsable ? (
        <div className={style['collapsable-container']} data-display={display}>
          <div className={style['collapsable-content']}>{children}</div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </section>
  );
}
