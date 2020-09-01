import React from 'react';


const Context = React.createContext({});

export default class LegendContext extends React.Component {

  static Consumer = Context.Consumer;

  constructor() {
    super(...arguments);
    this.state = {
      colorBoxAnnotColorLookup: {},
      underscoreAnnotColorLookup: {},
      aminoAcidsCatColorLookup: {}
    };
  }

  handleUpdate = state => {
    if (JSON.stringify(state) !== JSON.stringify(this.state)) {
      this.setState(state);
    }
  }

  render() {
    return <Context.Provider value={{
      ...this.state,
      onUpdate: this.handleUpdate
    }}>
      {this.props.children}
    </Context.Provider>;
  }
}
