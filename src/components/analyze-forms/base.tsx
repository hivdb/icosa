import React from 'react';
import classNames from 'classnames';
import {useRouter} from 'found';

import Button from '../button';

import style from './style.module.scss';

/**
 * Retrieve previously entered form values from the router location.
 *
 * @remarks
 * The router stores user input in the `location.state` object when navigating
 * between form pages.  This hook extracts that state so the form can be
 * pre-filled when the user returns to it.
 *
 * @returns A plain object containing any saved input state.  If the location
 * does not include a `state` object an empty object is returned.
 */
function useSavedInput(): Record<string, any> {
  const {
    match: {
      location: {state = {}}
    }
  } = useRouter();
  return state as Record<string, any>;
}

/** Props for {@link AnalyzeBaseForm}. */
export interface AnalyzeBaseFormProps {
  /** Destination pathname to navigate after successful submission. */
  to: string;
  /** Submit handler returning validation result, state and optional query. */
  onSubmit(
    e: React.SyntheticEvent
  ): Promise<[
    boolean,
    Record<string, any>,
    Record<string, any>?
  ]>;
  /** Reset handler invoked when user clicks reset. */
  onReset(e: React.SyntheticEvent): void;
  /** Form body or render function receiving saved input. */
  children: React.ReactNode | ((state: Record<string, any>) => React.ReactNode);
  /** Optional CSS class applied to the container. */
  className?: string;
  /** Whether reset button should be disabled. */
  resetDisabled: boolean;
  /** Whether submit button should be disabled. */
  submitDisabled: boolean;
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
        // eslint-disable-next-line no-unused-vars
        let {location: {state: _state, ...loc}} = match as any;
        const pathname = to;
        if (outputOption && outputOption !== 'default') {
          query = {...query, output: outputOption};
        }
        loc = {...loc, state, pathname, query} as any;
        router.push(loc);
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
      // eslint-disable-next-line no-unused-vars
      const {location: {state, ...loc}} = match as any;
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

