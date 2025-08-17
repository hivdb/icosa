import React from 'react';
import classNames from 'classnames';

import Button, {ButtonSize, ButtonStyle} from '../button';

import style from './style.module.scss';

const onVoid = () => null;

export interface FileInputProps {
  name?: string;
  className?: string;
  accept?: string;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  children?: React.ReactNode;
  hideSelected?: boolean;
  btnSize?: ButtonSize;
  onChange?: (files: File[]) => void;
  btnStyle?: ButtonStyle;
}

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

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLSpanElement>) => {
      e && e.preventDefault();
      let files: File[] = [];
      const dt = (e as React.DragEvent<HTMLSpanElement>).dataTransfer;
      if (dt?.items) {
        files = Array.from(dt.items)
          .filter(({kind}) => kind === 'file')
          .map(item => item.getAsFile() as File);
      }
      else if ((e as React.ChangeEvent<HTMLInputElement>).currentTarget.files) {
        files = Array.from((e as React.ChangeEvent<HTMLInputElement>).currentTarget.files as FileList);
      }
      if (files.length > 0) {
        let fname = files[0].name;
        if (!multiple) {
          files = files.slice(0, 1);
        }
        if (files.length > 1) {
          fname += ' ...';
        }
        setValue(fname);
      }
      if (onChange) onChange(files);
    },
    [multiple, onChange]
  );

  const handleUpload = React.useCallback(
    (e: React.MouseEvent) => {
      if ((e as any).buttons && (e as any).buttons !== 1) {
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
      onDrop={handleChange}
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
