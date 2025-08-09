import React from 'react';

import style from './style.module.scss';

import Button from '../../../../components/button';

interface FootnoteOpenerProps {
  /** Disable the button when there are no selected positions. */
  disabled: boolean;
  /** Handler invoked when the footnote view is requested. */
  onClick: () => void;
}

/**
 * Button used to open the footnote panel containing comments and 3D view.
 */
export default function FootnoteOpener({
  disabled,
  onClick
}: FootnoteOpenerProps) {

  return (
    <div className={style['input-group']}>
      <h3>3D view and mutation comments:</h3>
      <div className={style['inline-buttons']}>
        <Button
         data-no-blur
         name="footnote-opener"
         btnStyle="primary"
         disabled={disabled}
         onClick={onClick}>
          {disabled ? '(Select a position)' : 'View'}
        </Button>
      </div>
    </div>
  );
}
