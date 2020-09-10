import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import {
  annotShape, curAnnotNamesArray,
  annotCategoryShape} from '../../prop-types';
import LegendContext from '../legend-context';
import {sentenceCase} from '../../utils';

import style from './style.module.scss';


function filterAnnotations(annots, {name: curCat}) {
  return annots.filter(({category}) => category === curCat);
}


export default class AnnotCategory extends React.Component {

  static propTypes = {
    annotCategory: annotCategoryShape.isRequired,
    curAnnotNames: curAnnotNamesArray.isRequired,
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    onChange: PropTypes.func.isRequired
  }

  static defaultProps = {
    curAnnotNames: []
  }

  static getDerivedStateFromProps(props, state = {}) {
    const {
      annotations: allAnnots,
      curAnnotNames = [],
      annotCategory = {}
    } = props;
    if (
      JSON.stringify(state.annotCategory) ===
      JSON.stringify(annotCategory) &&
      JSON.stringify(state.curAnnotNames) ===
      JSON.stringify(curAnnotNames) &&
      state.allAnnots === allAnnots
    ) {
      return null;
    }
    return {
      annotCategory,
      allAnnots,
      curAnnotNames,
      catAnnots: filterAnnotations(allAnnots, annotCategory)
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
  }

  get options() {
    const {
      annotCategory: {multiSelect},
      curAnnotNames
    } = this.props;
    let {catAnnots} = this.state;
    if (multiSelect) {
      catAnnots = catAnnots
        .filter(({name}) => (
          !curAnnotNames.includes(name)
        ));
    }
    return (
      catAnnots
        .map(({name, label}) => ({
          value: name,
          label: label ? label : sentenceCase(name)
        }))
    );
  }

  handleAdd = ({value}) => {
    const {
      annotCategory: {
        multiSelect
      },
      curAnnotNames,
      onChange
    } = this.props;
    if (multiSelect) {
      if (curAnnotNames.some(name => name === value)) {
        return;
      }
      curAnnotNames.push(value);
      onChange(curAnnotNames);
    }
    else {
      onChange([value]);
    }
  }

  handleRemove = evt => {
    evt.preventDefault();
    const {currentTarget: {dataset: {annotName}}} = evt;
    const {
      curAnnotNames,
      onChange
    } = this.props;
    const newAnnotNames = curAnnotNames.filter(
      name => name !== annotName
    );
    if (curAnnotNames.length > newAnnotNames.length) {
      onChange(newAnnotNames);
    }
  }

  handleRemoveAll = evt => {
    evt.preventDefault();
    this.props.onChange([]);
  }

  render() {
    const {
      curAnnotNames,
      annotCategory: {
        name: catName,
        display,
        dropdown,
        multiSelect,
        annotStyle
      }
    } = this.props;

    if (display === false) {
      return null;
    }

    if (dropdown === false && !multiSelect) {
      return null;
    }

    const {options} = this;
    const displayName = display ? display : catName;
    let dropdownValue = null;
    if (!multiSelect && curAnnotNames && curAnnotNames.length) {
      dropdownValue = curAnnotNames[0];
    }

    return (
      <div className={style['input-group']}>
        <LegendContext.Consumer>
          {({underscoreAnnotColorLookup}) => <>
            <h3>
              Select {displayName}
              {multiSelect && curAnnotNames.length > 0 ? <>
                {' ('}<a
                 href="#remove-all-annots"
                 onClick={this.handleRemoveAll}>
                  remove all
                </a>)
              </> : null}:
            </h3>
            {dropdown ?
              <Dropdown
               value={dropdownValue}
               options={options}
               name={`annot-dropdown-${catName}`}
               placeholder={`Select ${displayName}...`}
               className={style['dropdown-annotations']}
               onChange={this.handleAdd} /> : null}
            {annotStyle === 'underscore' && curAnnotNames.length > 0 ?
              <ul className={style['scrollable']}>
                {curAnnotNames.map((name) => (
                  <li key={name}>
                    <span className={style['us-annot-name']} style={{
                      borderBottomColor: underscoreAnnotColorLookup[name]
                    }}>
                      {name}
                    </span> (
                    <a
                     href="#remove-annot"
                     data-annot-name={name}
                     onClick={this.handleRemove}>
                      remove
                    </a>)
                  </li>
                ))}
              </ul> : null}
          </>}
        </LegendContext.Consumer>
      </div>
    );
  }
}
