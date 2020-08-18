import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import Button from '../../../../components/button';

import {annotShape} from '../../prop-types';

import style from './style.module.scss';


export default class ExtraAnnotFilter extends React.Component {

  static propTypes = {
    allowEditing: PropTypes.bool.isRequired,
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    defaultExtraAnnots: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    extraAnnots: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  static getDerivedStateFromProps(props, state = {}) {
    const {
      annotations,
      extraAnnots = []
    } = props;
    if (
      JSON.stringify(state.extraAnnots) ===
      JSON.stringify(extraAnnots) &&
      state.annotations === annotations
    ) {
      return null;
    }
    return {
      annotations,
      extraAnnots
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
  }

  get options() {
    const {annotations} = this.props;
    return annotations.map(({name}) => name);
  }

  get canSave() {
    const {defaultExtraAnnots, extraAnnots} = this.props;
    if (defaultExtraAnnots.length !== extraAnnots.length) {
      return true;
    }
    const extraAnnotNames = extraAnnots.map(({name}) => name);
    return (
      JSON.stringify(defaultExtraAnnots) !==
      JSON.stringify(extraAnnotNames)
    );
  }

  handleAdd = ({value}) => {
    const {
      extraAnnots,
      annotations,
      onChange
    } = this.props;
    if (extraAnnots.some(({name}) => name === value)) {
      return;
    }
    for (const annot of annotations) {
      if (annot.name === value) {
        extraAnnots.push(annot);
        onChange(extraAnnots);
        break;
      }
    }
  }

  handleRemove = evt => {
    evt.preventDefault();
    const {currentTarget: {dataset: {annotName}}} = evt;
    const {
      extraAnnots,
      onChange
    } = this.props;
    const newExtraAnnots = extraAnnots.filter(
      ({name}) => name !== annotName
    );
    if (extraAnnots.length > newExtraAnnots.length) {
      onChange(newExtraAnnots);
    }
  }

  handleReset = () => {
    this.props.onChange(null);
  }

  handleSave = () => {
    const {extraAnnots, onSave} = this.props;
    onSave({
      action: 'editDefaultExtraAnnots',
      extraAnnots
    });
  }

  render() {
    const {options, canSave} = this;
    const {allowEditing, extraAnnots} = this.props;

    return (
      <div className={style['input-group']}>
        <label htmlFor="extra-annot">
          {allowEditing ? 'Editing default a' : 'A'}
          dditional annotation groups:
        </label>
        <ul>
          {extraAnnots.map(({name}) => (
            <li key={name}>
              {name} (
              <a
               href="#remove-extra-annot"
               data-annot-name={name}
               onClick={this.handleRemove}>
                remove
              </a>)
            </li>
          ))}
        </ul>
        <Dropdown
         value={null}
         options={options}
         name="annotation"
         className={style['dropdown-annotations']}
         onChange={this.handleAdd} />
        {allowEditing && canSave ? (
          <div className={style['inline-buttons']}>
            <Button
             name="save"
             btnStyle="primary"
             onClick={this.handleSave}>
              Save
            </Button>
            <Button
             name="cancel"
             btnStyle="light"
             onClick={this.handleReset}>
              Reset
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

}
