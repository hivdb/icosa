import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {useRouter} from 'found';

import Button from '../button';

import style from './style.module.scss';


function useSavedInput() {
  const {
    match: {
      location: {
        state = {}
      }
    }
  } = useRouter();
  return state;
}


AnalyzeBaseForm.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  resetDisabled: PropTypes.bool.isRequired,
  submitDisabled: PropTypes.bool.isRequired,
  to: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

export default function AnalyzeBaseForm({
  to,
  onSubmit,
  onReset,
  children,
  className,
  resetDisabled,
  submitDisabled
}) {

  const {router, match} = useRouter();
  const savedInput = useSavedInput();

  const handleSubmit = React.useCallback(
    async (e) => {
      e.persist();
      let [validated, state, query = {}] = await onSubmit(e);
      const {outputOption} = state;
      e.preventDefault();
      if (validated) {
      // eslint-disable-next-line no-unused-vars
        let {location: {state: _, ...loc}} = match;
        const pathname = to;
        if (outputOption !== 'default') {
          query = {...query, output: outputOption};
        }
        loc = {...loc, state, pathname, query};
        router.push(loc);
      }
    },
    [match, onSubmit, router, to]
  );

  const handleReset = React.useCallback(
    (e) => {
      e.persist();
      // eslint-disable-next-line no-unused-vars
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
