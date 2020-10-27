import React from 'react';

const Context = React.createContext({});


export default class PaginatorContext extends React.Component {

  static Consumer = Context.Consumer;

  static getDerivedStateFromProps(props, state) {
    return props.value;
  }

  constructor() {
    super(...arguments);
    this.state = this.props.value;
  }

  render() {
    const {children} = this.props;
    return <Context.Provider value={this.state}>
      {children}
    </Context.Provider>;
  }

}
