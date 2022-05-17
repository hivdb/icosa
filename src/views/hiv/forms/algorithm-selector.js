import React from 'react';
import PropTypes from 'prop-types';

import readFile from '../../../utils/read-file';
import BigData from '../../../utils/big-data';

import FileInput from '../../../components/file-input';
import AlgVerSelect, {
  getLatestVersions
} from '../../../components/algver-select';

import style from './style.module.scss';

SelectedAlgorithm.propTypes = {
  children: PropTypes.node.isRequired,
  onRemove: PropTypes.func.isRequired
};

function SelectedAlgorithm({
  children,
  onRemove
}) {
  const handleRemove = React.useCallback(
    event => {
      event.preventDefault();
      onRemove();
    },
    [onRemove]
  );

  return <span className={style['selected-alg']}>
    {children}
    <a
     href="#remove-alg"
     onClick={handleRemove}
     title="Remove this algorithm"
     className={style['remove-btn']}>
      X
    </a>
  </span>;
}

function getCustomAlgLabel(fileName) {
  return fileName.replace(/.xml$/i, '') + ' (local)';
}

function getCustomAlgValue(fileName) {
  return `CUSTOM-ALG-${fileName}`;
}

function isCustomAlg(value) {
  return value.startsWith('CUSTOM-ALG-');
}


AlgorithmSelector.propTypes = {
  config: PropTypes.shape({
    messages: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired
  }),
  algorithms: PropTypes.objectOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired
    }).isRequired
  ).isRequired,
  onChange: PropTypes.func.isRequired
};


function AlgorithmSelector({
  config,
  algorithms,
  onChange
}) {
  const {messages} = config;
  const [checkboxError, setCheckboxError] = React.useState(null);

  const mounted = React.useRef(true);
  React.useEffect(() => (() => mounted.current = false), []);

  const timeoutLock = React.useRef(null);
  const setTimeoutClearError = React.useCallback(
    () => {
      if (timeoutLock.current !== null) {
        clearTimeout(timeoutLock.current);
      }
      timeoutLock.current = setTimeout(() => {
        if (mounted.current) {
          setCheckboxError(null);
          timeoutLock.current = null;
        }
      }, 5000);
    },
    [setCheckboxError]
  );

  const handleAdd = React.useCallback(
    ({value, label}) => {
      algorithms[value] = {value, label};
      onChange(algorithms);
    },
    [algorithms, onChange]
  );

  const handleRemove = React.useCallback(
    name => {
      if (Object.keys(algorithms).length > 2) {
        delete algorithms[name];
        onChange(algorithms);
      }
      else {
        setCheckboxError('At least 2 algorithms must be selected!');
        setTimeoutClearError();
      }
    },
    [algorithms, onChange, setTimeoutClearError]
  );

  const handleUpload = React.useCallback(
    async (fileList) => {
      fileList = [...fileList];
      if (fileList.length === 0) {
        return;
      }
      const myAlgorithms = {...algorithms};
      for (let file of fileList) {
        const fileName = file.name;
        const value = getCustomAlgValue(fileName);
        myAlgorithms[value] = {
          label: getCustomAlgLabel(fileName),
          value,
          xml: await readFile(file)
        };
      }
      if (mounted.current) {
        onChange(myAlgorithms);
      }
    },
    [algorithms, onChange]
  );


  return (
    <fieldset className={style['algorithm-options']}>
      <legend>{
        messages['multi-algorithm-selection-title'] ||
        '<multi-algorithm-selection-title>'
      }</legend>
      <div>{
        messages['multi-algorithm-selection-desc'] ||
        '<multi-algorithm-selection-desc>'
      }</div>
      {Object.keys(algorithms).length > 0 ?
        <p>
          <span className={style['with-trailing-space']}>{
            messages['multi-algorithm-selection-selected-algs'] ||
            '<multi-algorithm-selection-selected-algs>'
          }</span>
          {Object.values(algorithms)
            .map(({value, label}, idx) => (
              <SelectedAlgorithm
               key={idx}
               onRemove={() => handleRemove(value)}>
                {label}
              </SelectedAlgorithm>
            ))
          }
        </p> : null}
      <div>
        <AlgVerSelect
         name="algver-select"
         config={config}
         value={null}
         onChange={handleAdd} />
        <span className={style['with-trailing-space']}> or </span>
        <FileInput
         btnStyle="info"
         onChange={handleUpload}
         name="custom-asi-file"
         multiple={true}
         hideSelected={true}
         accept="application/xml">
          Choose Local ASI2 File(s)
        </FileInput>
        <span className={style['checkbox-error']}>
          {checkboxError}
        </span>
      </div>
    </fieldset>
  );
}


export default function useAlgorithmSelector(config) {
  const {
    algorithmVersions,
    excludeAlgorithmVersions
  } = config;

  const defaultAlgorithms = React.useMemo(
    () => algorithmVersions ? getLatestVersions({
      algorithmVersions,
      excludeAlgorithmVersions
    }).reduce((acc, {value, label}) => {
      acc[value] = {value, label};
      return acc;
    }, {}) : {},
    [algorithmVersions, excludeAlgorithmVersions]
  );

  const [algorithms, setAlgorithms] = React.useState(defaultAlgorithms);

  const getAlgorithms = React.useCallback(
    () => {
      const publicAlgorithms = Object.keys(algorithms)
        .filter(alg => !isCustomAlg(alg));
      const customAlgorithms = Object.keys(algorithms)
        .filter(alg => isCustomAlg(alg))
        .reduce((list, alg) => {
          const {label, xml} = algorithms[alg];
          list.push({name: label, xml});
          return list;
        }, []);
      return [publicAlgorithms, customAlgorithms];
    },
    [algorithms]
  );

  const getSubmitState = React.useCallback(
    async () => {
      let [algorithms, customAlgorithms] = getAlgorithms();
      customAlgorithms = await BigData.save(customAlgorithms);
      return {algorithms, customAlgorithms};
    },
    [getAlgorithms]
  );

  return [
    algorithmVersions ? <AlgorithmSelector
     {...{
       config,
       algorithms,
       onChange: setAlgorithms
     }} /> : null,
    getSubmitState
  ];
}
