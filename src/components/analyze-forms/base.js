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


function AnalyzeBaseForm({
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

  async function handleSubmit(e) {
    e.persist();
    let [validated, state, query = {}] = await onSubmit(e);
    const {outputOption} = state;
    e.preventDefault();
    if (validated) {
      let {location: {state: _, ...loc}} = match;
      const pathname = to;
      if (outputOption !== 'default') {
        query = {...query, output: outputOption};
      }
      loc = {...loc, state, pathname, query};
      router.push(loc);
    }
  }

  function handleReset(e) {
    e.persist();
    const {location: {state, ...loc}} = match;
    router.replace(loc);
    onReset(e);
  }

}

AnalyzeBaseForm.propTypes = {
  allowRetainingInput: PropTypes.bool.isRequired,
  retainInputLabel: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  resetDisabled: PropTypes.bool.isRequired,
  submitDisabled: PropTypes.bool.isRequired,
  to: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

AnalyzeBaseForm.defaultProps = {
  allowRetainingInput: false,
  retainInputLabel: 'Save input data in my browser for future use'
};

export default AnalyzeBaseForm;
