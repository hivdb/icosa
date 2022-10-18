import React from 'react';
import PropTypes from 'prop-types';
import {v4 as uuidv4} from 'uuid';

import CheckboxInput from '../../checkbox-input';
import createLocationState from '../../../utils/use-location-state';
import createPersistedReducer from '../../../utils/use-persisted-reducer';
import ConfigContext from '../../../utils/config-context';
import MutationsInput from '../../mutations-input';
import Loader from '../../loader';

import BaseForm from '../base';
import parentStyle from '../style.module.scss';

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


const useRetainInputOpt = createPersistedReducer(KEY_RETAIN_INPUT_OPT);
const usePatterns = createLocationState('patterns');


function PatternsInputForm({children, to, onSubmit}) {

  const [
    retainInputOpt,
    toggleRetainInputOpt
  ] = useRetainInputOpt(flag => !flag, true);

  const [config, isConfigPending] = ConfigContext.use();
  const [
    patterns,
    setPatterns
  ] = usePatterns([newPatternObj()], () => retainInputOpt);

  const disabled = patterns.every(pat => pat.length === 0);
  const [
    submitDisabled,
    setSubmitDisabled
  ] = React.useState(disabled);

  const handleSubmit = React.useCallback(
    async (e) => {
      const payload = {
        patterns: patterns.map(({uuid, name, mutations, ...pattern}) => ({
          ...pattern,
          name: (!name || name === uuid) ? mutations.join('+') : name,
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
      return [validated, state, {
        name: payload.patterns[0].name,
        mutations: payload.patterns[0].mutations.join(',')
      }];
    },
    [onSubmit, patterns]
  );

  const handleChange = React.useCallback(
    ({uuid, name, mutations}, preventSubmit) => {
      if (uuid) {
        const patternObj = patterns.find(({uuid: myUUID}) => myUUID === uuid);
        patternObj.name = name;
        patternObj.mutations = mutations;
        setPatterns([...patterns]);
      }
      if (preventSubmit) {
        submitDisabled || setSubmitDisabled(true);
      }
      else if (submitDisabled && !disabled) {
        submitDisabled && setSubmitDisabled(false);
      }
    },
    [disabled, patterns, setPatterns, submitDisabled]
  );

  const handleReset = React.useCallback(
    () => setPatterns([newPatternObj()]),
    [setPatterns]
  );

  return (
    <BaseForm
     allowRetainingInput
     retainInputLabel="Save input mutations in my browser for future use"
     resetDisabled={disabled}
     submitDisabled={submitDisabled}
     to={to}
     onSubmit={handleSubmit}
     onReset={handleReset}>
      {children}
      <div className={style['patterns-input-container']}>
        {isConfigPending ? <Loader inline /> :
          patterns.map(({uuid, name, mutations}) => (
            <MutationsInput
             key={uuid}
             uuid={uuid}
             name={name}
             config={config}
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

}


PatternsInputForm.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
  onSubmit: PropTypes.func
};


export default PatternsInputForm;
