import React from 'react';

import {HoverPopup} from '../../../popup';

import style from '../style.module.scss';

export interface ItemNameInputProps {
  name: string;
  value: string;
  setValue: (value: string) => void;
}

export default function ItemNameInput({
  name,
  value,
  setValue
}: ItemNameInputProps) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.currentTarget.value),
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
