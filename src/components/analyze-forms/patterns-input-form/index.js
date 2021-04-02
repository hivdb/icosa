import React from 'react';
import PropTypes from 'prop-types';
import {v4 as uuidv4} from 'uuid';

import CheckboxInput from '../../checkbox-input';
import useLocationState from '../../../utils/use-location-state';

import BaseForm from '../base';
import parentStyle from '../style.module.scss';

import MutationsInput from './mutations-input';
import style from './style.module.scss';


const KEY_RETAIN_INPUT_OPT = '--analyze-form-retain-input-opt';


function newPatternObj() {
  const uuid = uuidv4();
  return {
    uuid,
    name: uuid,
    mutations: []
  };
}


function useRetainInputOpt() {
  const [opt, setOpt] = React.useState(
    window.localStorage.getItem(KEY_RETAIN_INPUT_OPT) === 'true'
  );
  const toggleOptWithLocalStorage = () => {
    const newOpt = !opt;
    window.localStorage.setItem(KEY_RETAIN_INPUT_OPT, newOpt.toString());
    setOpt(newOpt);
  };

  return [opt, toggleOptWithLocalStorage];
}


function PatternsInputForm({children, to, onSubmit}) {

  const [
    retainInputOpt,
    toggleRetainInputOpt
  ] = useRetainInputOpt();

  const [
    patterns,
    setPatterns
  ] = useLocationState('patterns', [newPatternObj()], () => retainInputOpt);

  const disabled = patterns.every(pat => pat.length === 0);
  const [
    submitDisabled,
    setSubmitDisabled
  ] = React.useState(disabled);

  return (
    <BaseForm
     allowRetainingInput
     retainInputLabel="Save input mutations in my browser for future use"
     resetDisabled={disabled}
     submitDisabled={submitDisabled}
     className={style.mutationInputForm}
     to={to}
     onSubmit={handleSubmit}
     onReset={handleReset}>
      {children}
      <div className={style['patterns-input-container']}>
        {patterns.map(({uuid, name, mutations}) => (
          <MutationsInput
           key={uuid}
           uuid={uuid}
           name={name}
           mutations={mutations}
           onChange={handleChange}
           isActive={true} />
        ))}
      </div>
      <div className={parentStyle['analyze-base-form-submit-options']}>
        <CheckboxInput
         id="retain-input-opt"
         name="retain-input-opt"
         value=""
         onChange={toggleRetainInputOpt}
         checked={retainInputOpt}>
          Save input mutations in my browser for future use
        </CheckboxInput>
      </div>
    </BaseForm>
  );

  async function handleSubmit(e) {
    const payload = {
      patterns: patterns.map(({mutations, ...pattern}) => ({
        ...pattern,
        name: mutations.join('+'),
        mutations
      }))
    };
    let validated = true;
    let state = {};
    if (onSubmit) {
      [validated, state] = await onSubmit(e, payload);
    }
    if (validated) {
      state = {...state, ...payload};
    }
    return [validated, state];
  }

  function handleChange({uuid, name, mutations}, preventSubmit) {
    const patternObj = patterns.find(({uuid: myUUID}) => myUUID === uuid);
    patternObj.name = name;
    patternObj.mutations = mutations;
    setPatterns([...patterns]);
    if (preventSubmit) {
      setSubmitDisabled(true);
    }
    else if (submitDisabled && !disabled) {
      setSubmitDisabled(false);
    }
  }

  function handleReset() {
    setPatterns([newPatternObj()]);
  }

}


PatternsInputForm.propTypes = {
  defaultPatterns: PropTypes.arrayOf(
    PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      mutations: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
    }).isRequired
  ).isRequired,
  children: PropTypes.node,
  to: PropTypes.string,
  onSubmit: PropTypes.func
};


export default PatternsInputForm;
