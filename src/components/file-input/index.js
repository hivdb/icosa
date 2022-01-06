import React from 'react';
import PropTypes from 'prop-types';

import Button from '../button';

import style from './style.module.scss';


export default class FileInput extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    accept: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    children: PropTypes.node,
    hideSelected: PropTypes.bool,
    btnSize: PropTypes.string,
    onChange: PropTypes.func,
    btnStyle: PropTypes.string.isRequired
  }

  static defaultProps = {
    btnStyle: 'info'
  }

  constructor() {
    super(...arguments);
    this.state = {value: ''};
    this.inputRef = React.createRef();
  }

  handleChange = (e) => {
    this.setState({
      value: e.currentTarget.value.split(/(\\|\/)/g).pop()
    });
    if (this.props.onChange) this.props.onChange(e.currentTarget.files);
  }

  render() {
    let {
      name,
      accept,
      placeholder,
      disabled,
      multiple,
      children,
      hideSelected,
      btnSize,
      btnStyle
    } = this.props;
    placeholder = placeholder || "No file chosen";
    return (
      <span className={style['file-input']}>
        <input
         ref={this.inputRef}
         type="file"
         tabIndex="-1"
         name={name} value=""
         onChange={this.handleChange}
         accept={accept}
         disabled={disabled}
         multiple={multiple}
         className={style['file-input_file']} />
        <Button
         btnSize={btnSize}
         btnStyle={btnStyle}
         disabled={disabled}
         onClick={() => this.inputRef.current.click()}
         name={`${name}_button`}>
          {children ? children : "Choose File"}
        </Button>
        {hideSelected ? null :
        <input
         type="text"
         tabIndex="-1"
         name={`${name}_filename`}
         size={Math.min(Math.max(this.state.value.length, 20), 120)}
         value={this.state.value}
         onMouseDown={(e) => {
           this.inputRef.current.click();
           e.preventDefault();
         }}
         onChange={() => {}}
         placeholder={placeholder}
         disabled={disabled}
         readOnly={true}
         className={style['file-input_text']} />}
      </span>
    );
  }
}
