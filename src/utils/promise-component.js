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
    let {children} = this.props;
    let childProps = null;
    this.state = {
      loaded: false,
      childProps,
      children
    };
  }
  
  static getStateFromResult(result, then, component, promise) {
    let state = {};
    result = then(result);
    if (component) {
      state = {
        loaded: promise,
        childProps: result
      };
    } else {
      state = {
        loaded: promise,
        children: result
      };
    }
    return state;
  }

  static getDerivedStateFromProps(props, state) {
    const {promise, children, then, component} = props;
    if (state.loaded === promise) {
      return null;
    }
    else if (promise && promise.then) {
      return {
        loaded: false,
        childProps: null,
        children
      };
    }
    else {
      return PromiseComponent.getStateFromResult(
        promise, then, component, promise
      );
    }
  }

  async _loadAsyncData(promise, then, error, component) {
    let result, callback;
    try {
      result = await promise;
      callback = then;
    }
    catch (e) {
      result = e.message;
      callback = error;
    }
    this.setState(
      this.constructor
        .getStateFromResult(result, callback, component, promise)
    );
  }

  async componentDidMount() {
    const {promise, then, error, component} = this.props;
    await this._loadAsyncData(promise, then, error, component);
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.loaded !== this.props.promise) {
      const {promise, then, error, component} = this.props;
      await this._loadAsyncData(promise, then, error, component);
    }
  }

  render() {
    const {children, childProps} = this.state;
    if (childProps) {
      const {component} = this.props;
      return React.createElement(component, childProps);
    } else {
      return <>{children}</>;
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
