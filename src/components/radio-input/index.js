import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


export default class RadioInput extends React.Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    title: PropTypes.string,
    children: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired
  };

  static defaultProps = {
    style: {},
    disabled: false
  };

  render() {
    const {
      id, name, value, title, onChange, checked, disabled,
      children, style: userStyle
    } = this.props;
    return (
      <span title={title} className={style['general-radio-input']}>
        <input
         id={id}
         type="radio" name={name}
         value={value}
         onChange={onChange}
         disabled={disabled}
         checked={checked} />
        <label
         data-disabled={disabled}
         style={userStyle}
         htmlFor={id}>
          {children}
        </label>
      </span>
    );
  }
}
