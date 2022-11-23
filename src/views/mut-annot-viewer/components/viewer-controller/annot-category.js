import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import {
  annotShape,
  curAnnotNamesArray,
  annotCategoryShape
} from '../../prop-types';
import LegendContext from '../legend-context';
import {sentenceCase} from '../../utils';

import style from './style.module.scss';


function filterAnnotations(annots, {name: curCat}) {
  return annots.filter(({category}) => category === curCat);
}


function getLabel({name, label}) {
  return label ? label : sentenceCase(name);
}


AnnotCategory.propTypes = {
  annotCategory: annotCategoryShape.isRequired,
  curAnnotNames: curAnnotNamesArray.isRequired,
  annotations: PropTypes.arrayOf(
    annotShape.isRequired
  ).isRequired,
  onChange: PropTypes.func.isRequired
};

AnnotCategory.defaultProps = {
  curAnnotNames: []
};

export default function AnnotCategory({
  annotCategory,
  curAnnotNames,
  annotations,
  onChange
}) {

  const options = React.useMemo(
    () => {
      const {multiSelect} = annotCategory;
      let catAnnots = filterAnnotations(annotations, annotCategory);
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
            label: getLabel({name, label})
          }))
      );
    },
    [curAnnotNames, annotations, annotCategory]
  );

  const handleAdd = React.useCallback(
    ({value}) => {
      const {multiSelect} = annotCategory;
      if (multiSelect) {
        if (curAnnotNames.some(name => name === value)) {
          return;
        }
        curAnnotNames.push(value);
        onChange([...curAnnotNames]);
      }
      else {
        onChange([value]);
      }
    },
    [onChange, annotCategory, curAnnotNames]
  );

  const handleRemove = React.useCallback(
    evt => {
      evt.preventDefault();
      const {currentTarget: {dataset: {annotName}}} = evt;
      const newAnnotNames = curAnnotNames.filter(
        name => name !== annotName
      );
      if (curAnnotNames.length > newAnnotNames.length) {
        onChange(newAnnotNames);
      }
    },
    [curAnnotNames, onChange]
  );

  const handleSelectAll = React.useCallback(
    evt => {
      evt.preventDefault();
      onChange(options.map(({value}) => value));
    },
    [onChange, options]
  );

  const handleRemoveAll = React.useCallback(
    evt => {
      evt.preventDefault();
      onChange([]);
    },
    [onChange]
  );

  const {
    name: catName,
    display,
    dropdown,
    multiSelect,
    annotStyle
  } = annotCategory;

  const displayName = display ? display : catName;
  let dropdownValue = null;
  if (!multiSelect && curAnnotNames && curAnnotNames.length) {
    dropdownValue = curAnnotNames[0];
  }
  const curAnnots = React.useMemo(
    () => annotations.filter(
      ({name}) => curAnnotNames.includes(name)
    ),
    [annotations, curAnnotNames]
  );

  const {
    underscoreAnnotColorLookup
  } = React.useContext(LegendContext.ContextObj);

  const jsx = React.useMemo(
    () => display && (dropdown || multiSelect) ?
      <div className={style['input-group']}>
        <h3>
          {displayName}
          {multiSelect && curAnnotNames.length === 0 ? <>
            {' ('}<a
             href="#select-all-annots"
             onClick={handleSelectAll}>
              select all
            </a>)
          </> : null}
          {multiSelect && curAnnotNames.length > 0 ? <>
            {' ('}<a
             href="#remove-all-annots"
             onClick={handleRemoveAll}>
              remove all
            </a>)
          </> : null}
          {!multiSelect && curAnnotNames.length === 1 ? <>
            {' ('}<a
             href="#remove-all-annots"
             onClick={handleRemoveAll}>
              remove selection
            </a>)
          </> : null}
          :
        </h3>
        {dropdown ?
          <Dropdown
           value={dropdownValue}
           options={options}
           name={`annot-dropdown-${catName}`}
           placeholder={`Select ${displayName}...`}
           className={style['dropdown-annotations']}
           onChange={handleAdd} /> : null}
        {multiSelect && curAnnotNames.length > 0 ?
          <ul className={style['fold']}>
            {curAnnots.map(({name, label}) => {
              let styleProps = {};
              if (annotStyle === 'underscore') {
                styleProps = {
                  className: style['us-annot-name'],
                  style: {
                    borderBottomColor: underscoreAnnotColorLookup[name]
                  }
                };
              }
              return <li key={name}>
                <span {...styleProps}>
                  {getLabel({name, label})}
                </span>
                <a
                 href="#remove-annot"
                 data-annot-name={name}
                 title={`Remove ${label}`}
                 className={style['remove-annot-button']}
                 onClick={handleRemove}>
                  remove
                </a>
              </li>;
            })}
          </ul> : null}
      </div> : null,
    [
      annotStyle,
      catName,
      curAnnotNames.length,
      curAnnots,
      display,
      displayName,
      dropdown,
      dropdownValue,
      handleAdd,
      handleRemove,
      handleRemoveAll,
      handleSelectAll,
      multiSelect,
      options,
      underscoreAnnotColorLookup
    ]
  );
  return <>{jsx}</>;
}
