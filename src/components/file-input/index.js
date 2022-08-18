import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Button from '../button';

import style from './style.module.scss';

const onVoid = () => null;


FileInput.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  accept: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  children: PropTypes.node,
  hideSelected: PropTypes.bool,
  btnSize: PropTypes.string,
  onChange: PropTypes.func,
  btnStyle: PropTypes.string.isRequired
};

FileInput.defaultProps = {
  btnStyle: 'info'
};

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
  btnStyle
}) {

  const [value, setValue] = React.useState('');
  const inputRef = React.useRef();

  const handleChange = React.useCallback(
    e => {
      e && e.preventDefault();
      let files = [];
      if (e && e.dataTransfer?.items) {
        files = Array.from(e.dataTransfer.items)
          .filter(({kind}) => kind === 'file')
          .map(item => item.getAsFile());
      }
      else if (e && e.currentTarget.files) {
        files = Array.from(e.currentTarget.files);
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
    e => {
      if (e.buttons && e.buttons !== 1) {
        return;
      }
      e && e.preventDefault();
      inputRef.current.click();
    },
    []
  );

  const handleDragOver = React.useCallback(
    e => {
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
       tabIndex="-1"
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
        {children ? children : "Choose File"}
      </Button>
      {hideSelected ? null :
      <input
       type="text"
       tabIndex="-1"
       name={`${name}_filename`}
       size={Math.min(Math.max(value.length, 20), 120)}
       value={value}
       onMouseDown={handleUpload}
       onChange={onVoid}
       placeholder={placeholder || 'No file chosen'}
       disabled={disabled}
       readOnly={true}
       className={style['file-input_text']} />}
    </span>
  );

}
