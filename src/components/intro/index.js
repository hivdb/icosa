import PropTypes from 'prop-types';
import React from 'react';
import style from './style.module.scss';


export class IntroHeader extends React.Component {

  static propTypes = {
    children: PropTypes.node.isRequired
  }

  render() {
    return <header>{this.props.children}</header>;
  }

}


export class IntroHeaderSupplement extends React.Component {

  render() {
    return <div className={style.supplement}>
      {this.props.children}
    </div>;
  }

}


export default class Intro extends React.Component {

  static propTypes = {
    children: PropTypes.node.isRequired
  }

  render() {
    let {children} = this.props;
    let header = null;
    let body = [];
    if (!(children instanceof Array)) {
      children = [children];
    }
    for (const element of children) {
      if (element && element.type === IntroHeader) {
        header = element;
      }
      else {
        body.push(element);
      }
    }

    return (
      <div className={style.intro}>
        {header}
        {body.length > 0 ?
          <section>
            {body}
          </section>
         : null}
      </div>
    );
  }

}
