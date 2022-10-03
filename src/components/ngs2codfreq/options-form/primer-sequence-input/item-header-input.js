import React from 'react';
import PropTypes from 'prop-types';

import {HoverPopup} from '../../../popup';

import style from '../style.module.scss';


ItemHeaderInput.propTypes = {
  name: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  setHeader: PropTypes.func.isRequired
};

export default function ItemHeaderInput({
  name,
  header,
  setHeader
}) {
  const handleChange = React.useCallback(
    event => setHeader(event.currentTarget.value),
    [setHeader]
  );

  return (
    <HoverPopup
     noUnderline
     position="left"
     message={<>
       Primer header
     </>}>
      <input
       type="text"
       id={name}
       name={name}
       className={style['name-input']}
       value={header}
       placeholder="Header"
       onChange={handleChange} />
    </HoverPopup>
  );
}
