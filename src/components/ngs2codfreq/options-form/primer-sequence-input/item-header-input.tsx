import React from 'react';

import {HoverPopup} from '../../../popup';

import style from '../style.module.scss';

export interface ItemHeaderInputProps {
  name: string;
  header: string;
  setHeader: (value: string) => void;
}

export default function ItemHeaderInput({
  name,
  header,
  setHeader
}: ItemHeaderInputProps) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setHeader(event.currentTarget.value),
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
