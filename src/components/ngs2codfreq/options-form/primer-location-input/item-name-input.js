import React from 'react';
import PropTypes from 'prop-types';

import {HoverPopup} from '../../../popup';

import style from '../style.module.scss';


ItemNameInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired
};

export default function ItemNameInput({
  name,
  value,
  setValue
}) {
  const handleChange = React.useCallback(
    event => setValue(event.currentTarget.value),
    [setValue]
  );

  return (
    <HoverPopup
     noUnderline
     position="left"
     message={<>
       Primer name
     </>}>
      <input
       type="text"
       id={name}
       name={name}
       className={style['name-input']}
       value={value}
       placeholder="Name"
       onChange={handleChange} />
    </HoverPopup>
  );
}
