import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {routerShape, matchShape} from 'found';

import Button from '../button';
import CheckboxInput from '../checkbox-input';

import style from './style.module.scss';


export default class AnalyzeBaseForm extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    allowRetainingInput: PropTypes.bool.isRequired,
    retainInputLabel: PropTypes.string.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    resetDisabled: PropTypes.bool.isRequired,
    submitDisabled: PropTypes.bool.isRequired,
    to: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired
  }

  static defaultProps = {
    allowRetainingInput: false,
    retainInputLabel: 'Keep my input data when browsing back'
  }

  constructor() {
    super(...arguments);
    this.state = {
      ...this.getRetainInput()
    };
  }

  getRetainInput() {
    const state = {
      retainInput: false
    };
    const {location: loc} = this.props.match;
    if (loc.state && 'retainInput' in loc.state) {
      state.retainInput = loc.state.retainInput;
    }
    return state;
  }

  handleOutputOptionsChange(e) {
    const outputOption = e.currentTarget.value;
    this.setState({outputOption});
  }

  handleSubmit = async (e) => {
    e.persist();
    let [validated, state, query] = await this.props.onSubmit(e);
    if (!query) {
      query = {};
    }
    const {outputOption} = state;
    e.preventDefault();
    if (validated) {
      const {retainInput} = this.state;
      state.retainInput = retainInput;
      let {location: {state: _, ...loc}} = this.props.match;
      const pathname = this.props.to;
      if (outputOption !== 'default') {
        query = {...query, output: outputOption};
      }
      if (retainInput) {
        loc = {...loc, state};
      }
      this.props.router.replace(loc);
      loc = {...loc, state, pathname, query};
      this.props.router.push(loc);
    }
  }

  handleReset = (e) => {
    e.persist();
    const {location: {state, ...loc}} = this.context;
    this.context.router.replace(loc);
    this.props.onReset(e);
  }

  toggleRetainInput = () => {
    const {retainInput} = this.state;
    this.setState({retainInput: !retainInput});
  }

  render() {
    let {
      children, className, resetDisabled,
      submitDisabled, allowRetainingInput, retainInputLabel
    } = this.props;
    const {retainInput} = this.state;
    className = classNames(style['analyze-base-form'], className);
    return (
      <div className={className}>
        {children}
        {allowRetainingInput ? 
          <div className={style['analyze-base-form-submit-options']}>
            <CheckboxInput
             id="retain-input"
             name="retain-input"
             value=""
             onChange={this.toggleRetainInput}
             checked={retainInput}>
              {retainInputLabel}
            </CheckboxInput>
          </div> : null}
        <div className={style['analyze-base-form-buttons']}>
          <Button
           onClick={this.handleSubmit}
           type="submit"
           name="submit"
           btnStyle="primary"
           disabled={submitDisabled}>
            Analyze
          </Button>
          <Button
           onClick={this.handleReset}
           type="reset"
           name="reset"
           disabled={resetDisabled}>
            Reset
          </Button>
        </div>
      </div>
    );
  }
}
