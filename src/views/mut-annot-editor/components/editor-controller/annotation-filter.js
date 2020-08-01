import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import {annotShape} from '../../prop-types';

import style from './style.module.scss';


export default class AnnotationFilter extends React.Component {

  static propTypes = {
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    curAnnot: annotShape.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  get curAnnotName() {
    const {curAnnot} = this.props;
    return curAnnot.name;
  }

  get options() {
    const {annotations} = this.props;
    return annotations.map(({name}) => name);
  }

  handleChange = ({value}) => {
    const {annotations, onChange} = this.props;
    for (const annot of annotations) {
      if (annot.name === value) {
        onChange(annot);
      }
    }
  }

  render() {
    const {options, curAnnotName} = this;

    return (
      <div className={style['input-group']}>
        <label htmlFor="annotation">Annotation filter:</label>
        <Dropdown
         value={curAnnotName}
         options={options}
         name="annotation"
         onChange={this.handleChange} />
      </div>
    );
  }

}
