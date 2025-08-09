import React from 'react';
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

/**
 * Structure representing a single user-defined mutation pattern.
 */
export interface PatternObj {
  /** Unique identifier used as both key and default name. */
  uuid: string;
  /** Pattern display name. */
  name: string;
  /** List of mutation strings comprising the pattern. */
  mutations: string[];
}

/**
 * Create a new empty pattern object used by the form.
 *
 * @returns Fresh pattern object with unique identifier.
 */
function newPatternObj(): PatternObj {
  const uuid = uuidv4();
  return {uuid, name: uuid, mutations: []};
}

const useRetainInputOpt = createPersistedReducer<boolean, unknown>(KEY_RETAIN_INPUT_OPT);
const usePatterns = createLocationState<PatternObj[]>('patterns');

export interface PatternsInputFormProps {
  /** Optional form body. */
  children?: React.ReactNode;
  /** Destination for navigation upon submit. */
  to?: string;
  /** Submit callback receiving the payload. */
  onSubmit?(e: React.SyntheticEvent, payload: any): Promise<any>;
}

/**
 * Form allowing users to input mutation patterns for analysis.
 *
 * @param props - {@link PatternsInputFormProps} controlling behaviour.
 * @returns Wrapper element containing mutations input UI.
 */
export default function PatternsInputForm({
  children,
  to,
  onSubmit
}: PatternsInputFormProps): React.JSX.Element {
  const [retainInputOpt, toggleRetainInputOpt] = useRetainInputOpt(
    (flag: boolean) => !flag,
    true
  );

  const [config, isConfigPending] = ConfigContext.use();
  const [patterns, setPatterns] = usePatterns([newPatternObj()], () => retainInputOpt);

  const disabled = patterns.every(pat => pat.mutations.length === 0);
  const [submitDisabled, setSubmitDisabled] = React.useState(disabled);

  const handleSubmit = React.useCallback(
    async (
      e: React.SyntheticEvent
    ): Promise<[boolean, Record<string, any>, Record<string, any>?]> => {
      const payload = {
        patterns: patterns.map(({uuid, name, mutations, ...pattern}) => ({
          ...pattern,
          name: !name || name === uuid ? mutations.join('+') : name,
          mutations
        }))
      };
      let validated = true;
      let state: Record<string, any> = {};
      if (onSubmit) {
        [validated, state] = await onSubmit(e, payload);
      }
      if (validated) {
        state = {...state, ...payload};
      }
      return [
        validated,
        state,
        {
          name: payload.patterns[0].name,
          mutations: payload.patterns[0].mutations.join(',')
        }
      ];
    },
    [onSubmit, patterns]
  );

  const handleChange = React.useCallback(
    (
      {uuid, name, mutations}: PatternObj,
      preventSubmit: boolean
    ) => {
      if (uuid) {
        const patternObj = patterns.find(p => p.uuid === uuid);
        if (patternObj) {
          patternObj.name = name;
          patternObj.mutations = mutations;
          setPatterns([...patterns]);
        }
      }
      if (preventSubmit) {
        submitDisabled || setSubmitDisabled(true);
      } else if (submitDisabled && !disabled) {
        submitDisabled && setSubmitDisabled(false);
      }
    },
    [disabled, patterns, setPatterns, submitDisabled]
  );

  const handleReset = React.useCallback(() => setPatterns([newPatternObj()]), [setPatterns]);

  return (
    <BaseForm
     allowRetainingInput
     retainInputLabel="Save input mutations in my browser for future use"
     resetDisabled={disabled}
     submitDisabled={submitDisabled}
     to={to as string}
     onSubmit={handleSubmit}
     onReset={handleReset}>
      {children}
      <div className={style['patterns-input-container']}>
        {isConfigPending ? (
          <Loader inline />
        ) : (
          patterns.map(({uuid, name, mutations}) => (
            <MutationsInput
             key={uuid}
             uuid={uuid}
             name={name}
             config={config!}
             mutations={mutations}
             onChange={handleChange}
             isActive={true}
            />
          ))
        )}
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

export {newPatternObj};

