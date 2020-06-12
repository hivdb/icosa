import PropTypes from 'prop-types';
import React from 'react';
import Loader from 'react-loader';
import sleep from 'sleep-promise';


export default class PromiseComponent extends React.Component {

  static propTypes = {
    promise: PropTypes.oneOfType([
      PropTypes.shape({
        then: PropTypes.func.isRequired
      }).isRequired,
      PropTypes.func.isRequired
    ]).isRequired,
    then: PropTypes.func.isRequired,
    error: PropTypes.func.isRequired,
    component: PropTypes.func,
    children: PropTypes.node.isRequired
  }

  static defaultProps = {
    children: <Loader loaded={false} />,
    then: value => value,
    error: value => value
  }

  constructor() {
    super(...arguments);
    let {promise, children, component, then, error} = this.props;
    let childProps = null;
    this.state = {
      childProps,
      children
    };
    if (promise && promise.then) {
      this.promiseWillUpdate(promise, then, error, component);
    }
    else {
      Object.assign(
        this.state,
        this.getStateFromPromiseResult(promise, then, component)
      );
    }
  }

  getStateFromPromiseResult(result, then, component) {
    let state;
    result = then(result);
    if (component) {
      state = {childProps: result};
    } else {
      state = {children: result};
    }
    return state;
  }

  async promiseWillUpdate(promise, then, error, component) {
    let result, callback;
    try {
      result = await promise;
      callback = then;
    }
    catch (e) {
      result = e.message;
      callback = error;
    }
    this.setState(this.getStateFromPromiseResult(result, callback, component));
  }

  async componentDidMount() {
    const {promise, then, error, component} = this.props;
    await this.promiseWillUpdate(promise, then, error, component);
  }

  async componentWillReceiveProps(nextProps) {
    const {promise, then, error, component} = nextProps;
    await this.promiseWillUpdate(promise, then, error, component);
  }

  render() {
    const {children, childProps} = this.state;
    if (childProps) {
      const {component} = this.props;
      return React.createElement(component, childProps);
    } else {
      return <div>{children}</div>;
    }
  }

}

class AsyncComponent extends React.Component {

  static propTypes = {
    children: PropTypes.func.isRequired,
    duration: PropTypes.number.isRequired
  }

  static defaultProps = {
    duration: 0
  }

  thenRender = () => {
    const {children} = this.props;
    return children();
  }

  render() {
    const {duration} = this.props;
    const promise = sleep(duration);
    return (
      <PromiseComponent
       promise={promise}
       then={this.thenRender} />
    );
  }

}

export {AsyncComponent};
