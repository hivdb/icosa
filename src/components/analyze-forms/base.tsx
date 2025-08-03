import React from 'react';
import classNames from 'classnames';
import {useRouter} from 'found';

import Button from '../button';

import style from './style.module.scss';

/**
 * Extract the `state` object from router location for pre-filling form inputs.
 *
 * @returns Saved input state from the router location or an empty object.
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
}: AnalyzeBaseFormProps): JSX.Element {
  const {router, match} = useRouter();
  const savedInput = useSavedInput();

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

