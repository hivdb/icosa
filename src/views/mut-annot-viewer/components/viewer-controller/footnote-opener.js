import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';

import Button from '../../../../components/button';


FootnoteOpener.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

export default function FootnoteOpener({
  disabled,
  onClick
}) {

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
