import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../../button';

import style from '../style.module.scss';


PrimerAddItem.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func.isRequired
};

PrimerAddItem.defaultProps = {
  label: 'Add another primer'
};

export default function PrimerAddItem({
  label,
  onClick
}) {
  return <div className={style['fieldrow']}>
    <div className={style['fieldlabel']} />
    <Button
     btnStyle="light"
     onClick={onClick}>
      {label}
    </Button>
  </div>;
}
