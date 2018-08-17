import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import VirtualizedSelect from 'react-virtualized-select';

import style from './style.scss';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';

export default class Select extends React.Component {

  static propTypes = {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
      }).isRequired
    ),
    allowCreate: PropTypes.bool,
    loadOptions: PropTypes.func,
    value: PropTypes.string,
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onCreate: PropTypes.func,
    promptTextCreator: PropTypes.func
  };

  static defaultProps = {
    editableByDefault: true,
  };

  handleChange(newValue) {
    const {onChange, onCreate, allowCreate} = this.props;
    if (!newValue) {
      return onChange(null);
    }
    const {value, cleanLabel} = newValue;
    if (allowCreate && value === '__new') {
      return onCreate({label: cleanLabel});
    }
    return onChange(newValue);
  }

  promptTextCreator(label) {
    const {label: labelName, promptTextCreator} = this.props;
    if (promptTextCreator) {
      return promptTextCreator(label);
    }
    return {
      label,
      prompt: `Create ${labelName.toLowerCase()} "${label}"`
    };
  }

  shouldKeyDownEventCreateNewOption({keyCode}) {
    if ([9 /*TAB*/, 13 /*ENTER*/, 188 /*,*/].indexOf(keyCode) > -1) {
      return false;
    }
  }

  newOptionCreator({label, labelKey, valueKey}) {
    const option = {};
    if (typeof label === 'object') {
      let {prompt} = label;
      label = label.label;
      option[labelKey] = prompt;
    }
    else {
      option[labelKey] = label;
    }
    option[valueKey] = '__new';
    option.cleanLabel = label;
    option.className = 'Select-create-option-placeholder';
    return option;
  }

  isValidNewOption({label}) {
    if (!label) {
      return false;
    }
    return true;
  }

  isOptionUnique({option, options, labelKey}) {
    return options
      .filter(existingOption => (
        existingOption[labelKey].toLowerCase() ===
        option[labelKey].toLowerCase()
      ))
      .length === 0;
  }

  render() {
    const {
      options, loadOptions, value, allowCreate,
      name, ...props} = this.props;
    let SelectComponent = ReactSelect; // the component used in JSX
    let selectComponent = null; // the component passed to VirtualizedSelect
    if (loadOptions) {
      SelectComponent = ReactSelect.Async;
    }
    if (allowCreate) {
      SelectComponent = ReactSelect.Creatable;
    }
    if (loadOptions && allowCreate) {
      SelectComponent = ReactSelect.AsyncCreatable;
    }
    if (options && options.length > 100) {
      selectComponent = SelectComponent;
      SelectComponent = VirtualizedSelect;
    }

    return (
      <SelectComponent
       shouldKeyDownEventCreateNewOption={this.shouldKeyDownEventCreateNewOption.bind(this)}
       newOptionCreator={this.newOptionCreator.bind(this)}
       promptTextCreator={this.promptTextCreator.bind(this)}
       isValidNewOption={this.isValidNewOption.bind(this)}
       isOptionUnique={this.isOptionUnique.bind(this)}
       {...props}
       selectComponent={selectComponent}
       name={name}
       value={value}
       onChange={this.handleChange.bind(this)}
       loadOptions={loadOptions}
       options={options} />
    );
  }

}
