import React from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';

import style from './style.module.scss';

import Button from '../../../../components/button';
import {seqViewerSizeType} from '../../prop-types';


SizeController.propTypes = {
  size: seqViewerSizeType.isRequired,
  onChange: PropTypes.func.isRequired
};

export default function SizeController({
  size: seqViewerSize,
  onChange
}) {

  const handleChange = React.useCallback(
    ({currentTarget: {value}}) => onChange(value),
    [onChange]
  );

  return (
    <div className={style['input-group']}>
      <h3>Viewer size:</h3>
      <div className={style['inline-buttons']}>
        {['large', 'middle', 'small'].map(size => (
          <Button
           key={size}
           name="size"
           btnStyle={size === seqViewerSize ? 'primary' : 'light'}
           onClick={handleChange}
           value={size}>
            {capitalize(size)}
          </Button>
        ))}
      </div>
    </div>
  );
}
