import React from 'react';
import classNames from 'classnames';

import Button from '../button';
import type {FileInputProps} from './types';

import style from './style.module.scss';

export type {FileInputProps} from './types';

const onVoid = () => null;

/**
 * Provide a styled file input with custom button and selected file display.
 *
 * @param props - {@link FileInputProps} describing input behaviour.
 * @returns Rendered file input component.
 */
export default function FileInput({
  name,
  className,
  accept,
  placeholder,
  disabled,
  multiple,
  children,
  hideSelected,
  btnSize,
  onChange,
  btnStyle = 'info'
}: FileInputProps) {
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const processFiles = React.useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        let fname = files[0].name;
        let processedFiles = files;
        if (!multiple) {
          processedFiles = files.slice(0, 1);
        }
        if (files.length > 1) {
          fname += ' ...';
        }
        setValue(fname);
        if (onChange) onChange(processedFiles);
      }
    },
    [multiple, onChange]
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e && e.preventDefault();
      const files: File[] = e.currentTarget.files ? Array.from(e.currentTarget.files) : [];
      processFiles(files);
    },
    [processFiles]
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLSpanElement>) => {
      e && e.preventDefault();
      let files: File[] = [];
      if (e.dataTransfer?.items) {
        files = Array.from(e.dataTransfer.items)
          .filter(({kind}) => kind === 'file')
          .map(item => item.getAsFile())
          .filter((file): file is File => file !== null);
      }
      processFiles(files);
    },
    [processFiles]
  );

  const handleUpload = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.buttons && e.buttons !== 1) {
        return;
      }
      e && e.preventDefault();
      inputRef.current?.click();
    },
    []
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLSpanElement>) => {
      e && e.preventDefault();
    },
    []
  );

  return (
    <span
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={classNames(className, style['file-input'])}>
      <input
        ref={inputRef}
        type="file"
        tabIndex={-1}
        name={name} value=""
        onChange={handleChange}
        accept={accept}
        disabled={disabled}
        multiple={multiple}
        className={style['file-input_file']} />
      <Button
        btnSize={btnSize}
        btnStyle={btnStyle}
        disabled={disabled}
        onClick={handleUpload}
        name={`${name}_button`}>
        {children ? children : 'Choose File'}
      </Button>
      {hideSelected ? null : (
      <input
        type="text"
        tabIndex={-1}
        name={`${name}_filename`}
        size={Math.min(Math.max(value.length, 20), 120)}
        value={value}
        onMouseDown={handleUpload}
        onChange={onVoid}
        placeholder={placeholder || 'No file chosen'}
        disabled={disabled}
        readOnly={true}
        className={style['file-input_text']} />)}
    </span>
  );
}
