import React from 'react';
import classNames from 'classnames';
import type {NumberDualRangeInputProps} from './types';

import style from './style.module.scss';

export type {NumberDualRangeInputProps} from './types';

export default function NumberDualRangeInput({
  className,
  nameStart,
  nameEnd,
  start,
  end,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  minGap = 1,
  disabled
}: NumberDualRangeInputProps) {
  const handleSelectAll = React.useCallback(
    (event: React.MouseEvent<HTMLInputElement>) => event.currentTarget.select(),
    []
  );

  const handleStartChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newStart = Number.parseFloat(event.currentTarget.value);
      if (event.currentTarget.type === 'number' || newStart <= end - minGap) {
        onChange(nameStart, newStart);
      }
    },
    [nameStart, end, minGap, onChange]
  );

  const handleEndChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newEnd = Number.parseFloat(event.currentTarget.value);
      if (event.currentTarget.type === 'number' || newEnd >= start + minGap) {
        onChange(nameEnd, newEnd);
      }
    },
    [nameEnd, start, minGap, onChange]
  );

  return <div className={classNames(
    style['dual-number-range'],
    className
  )}>
    <input
      disabled={disabled}
      type="number"
      id={`${nameStart}-number-input`}
      name={nameStart}
      min={min}
      max={max}
      step={step}
      value={start}
      onClick={handleSelectAll}
      onChange={handleStartChange} />
    <div className={style['dual-range-input']}>
      <input
        className={style['range-start']}
        disabled={disabled}
        type="range"
        id={`${nameStart}-range-input`}
        name={nameStart}
        min={min}
        max={max}
        step={step}
        value={start}
        onChange={handleStartChange} />
      <input
        className={style['range-end']}
        disabled={disabled}
        type="range"
        id={`${nameEnd}-range-input`}
        name={nameEnd}
        min={min}
        max={max}
        step={step}
        value={end}
        onChange={handleEndChange} />
    </div>
    <input
      disabled={disabled}
      type="number"
      id={`${nameEnd}-number-input`}
      name={nameEnd}
      min={min}
      max={max}
      step={step}
      value={end}
      onClick={handleSelectAll}
      onChange={handleEndChange} />
  </div>;
}
