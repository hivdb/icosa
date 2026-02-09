import React from 'react';
import classNames from 'classnames';
import {useRouter} from 'found';

import Button from '../button';
import type {AnalyzeBaseFormProps, FormSubmitState} from './types';
import type {LocationDescriptorObject} from 'farce';

import style from './style.module.scss';

export type {AnalyzeBaseFormProps};

/**
 * Retrieve previously entered form values from the router location.
 *
 * @remarks
 * The router stores user input in the `location.state` object when navigating
 * between form pages.  This hook extracts that state so the form can be
 * pre-filled when the user returns to it.
 *
 * @returns A plain object containing saved input state.  If the location
 * does not include a `state` object an empty object is returned.
 */
function useSavedInput(): FormSubmitState {
  const {
    match: {
      location: {state = {}}
    }
  } = useRouter();
  return state as FormSubmitState;
}


/**
 * Base wrapper used by all analyze forms providing consistent submit/reset
 * controls and navigation logic.
 *
 * @param props - {@link AnalyzeBaseFormProps} controlling form behaviour.
 * @returns Wrapper element containing provided children and buttons.
 */
export default function AnalyzeBaseForm({
  to,
  onSubmit,
  onReset,
  children,
  className,
  resetDisabled,
  submitDisabled
}: AnalyzeBaseFormProps): React.JSX.Element {
  const {router, match} = useRouter();
  const savedInput = useSavedInput();

  /**
   * Submit handler forwarded to the underlying HTML form. It delegates the
   * actual submission logic to the consumer provided {@link onSubmit} callback
   * and performs navigation when the submission is considered valid.
   *
   * @param e - Synthetic form submit event.
   */
  const handleSubmit = React.useCallback(
    async (e: React.SyntheticEvent) => {
      e.persist();
      let [validated, state, query = {}] = await onSubmit(e);
      const {outputOption} = state as {outputOption?: string};
      e.preventDefault();
      if (validated) {
        if (outputOption && outputOption !== 'default') {
          query = {...query, output: outputOption};
        }
        const newLocation: LocationDescriptorObject = {
          pathname: to,
          state,
          query
        };
        router.push(newLocation);
      }
    },
    [match, onSubmit, router, to]
  );

  /**
   * Reset handler that clears router state and notifies consumers. All form
   * values stored in the location state will be discarded.
   *
   * @param e - Synthetic reset event from the form.
   */
  const handleReset = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.persist();
      const {location: {state, ...loc}} = match;
      router.replace(loc);
      onReset(e);
    },
    [match, onReset, router]
  );

  return (
    <div
     className={classNames(
       style['analyze-base-form'],
       className
     )}>
      {children instanceof Function ? children(savedInput) : children}
      <div className={style['analyze-base-form-buttons']}>
        <Button
         onClick={handleSubmit}
         type="submit"
         name="submit"
         btnStyle="primary"
         disabled={submitDisabled}>
          Analyze
        </Button>
        <Button
         onClick={handleReset}
         type="reset"
         name="reset"
         disabled={resetDisabled}>
          Reset
        </Button>
      </div>
    </div>
  );
}

