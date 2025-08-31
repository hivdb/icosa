import React from 'react';
import capitalize from 'lodash/capitalize';

import style from './style.module.scss';

import Button from '../../../../components/button';
import type {SeqViewerSize} from '../../types';

interface SizeControllerProps {
  /** Current sequence viewer size. */
  size: SeqViewerSize;
  /** Callback when a new size is selected. */
  onChange: (size: SeqViewerSize) => void;
}

/**
 * Render buttons allowing the user to select the sequence viewer size.
 */
export default function SizeController({
  size: seqViewerSize,
  onChange
}: SizeControllerProps) {

  const handleChange = React.useCallback(
    ({currentTarget: {value}}: React.MouseEvent<HTMLButtonElement>) =>
      onChange(value as SeqViewerSize),
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
