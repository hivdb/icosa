import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'found';
import {useMountedCallback} from '../../utils/use-mounted';

const READY_EVENT = '_newwindowready';


NewWindowPropsProvider.propTypes = {
  routeProps: PropTypes.object.isRequired,
  overrideProps: PropTypes.object,
  Component: PropTypes.oneOfType([
    PropTypes.func.isRequired,
    PropTypes.object.isRequired
  ]).isRequired
};

function NewWindowPropsProvider({routeProps, overrideProps, Component}) {
  const touched = React.useRef();
  const [props, setProps] = React.useState();
  window.setProps = useMountedCallback(
    props => {
      touched.current = true;
      return setProps(props);
    },
    [setProps]
  );
  React.useEffect(
    () => {
      window.dispatchEvent(new Event(READY_EVENT));
    },
    []
  );

  return <>
    {touched.current ?
      <Component {...routeProps} {...props} {...overrideProps} /> : null}
  </>;
}


export class NewWindowRoute extends Route {
  constructor({pathPrefix, overrideProps, ...props}) {
    const path = pathPrefix ?
      pathPrefix.replace(/\/*$/, '/') + 'popup/' : 'popup/';
    super({...props, path});
    this.overrideProps = overrideProps;
  }

  render({Component, props}) {
    return (
      <NewWindowPropsProvider
       routeProps={props}
       overrideProps={this.overrideProps}
       Component={Component} />
    );
  }
}


export function useNewWindow(props, {
  name,
  onUnload,
  features
}) {
  const childWindowRef = React.useRef();
  const isChild = window.name === name;

  if (!isChild && !childWindowRef.current) {
    const to = window.location.pathname.replace(/\/*$/, '/') + 'popup/';
    childWindowRef.current = window.open(to, name, features);
  }

  React.useEffect(
    () => {
      if (!isChild) {
        return () => childWindowRef.current.close();
      }
    },
    [isChild]
  );

  const handleClose = React.useCallback(
    () => onUnload && onUnload(),
    [onUnload]
  );

  React.useEffect(
    () => {
      if (!isChild) {
        const childWin = childWindowRef.current;
        if (childWin.setProps) {
          childWin.setProps(props);
        }

        const handleReady = () => childWin.setProps(props);
        childWin.addEventListener(READY_EVENT, handleReady, false);
        childWin.addEventListener('beforeunload', handleClose, false);

        const closeCheckerInterval = setInterval(
          () => childWin.closed && handleClose(),
          50
        );

        return () => {
          childWin.removeEventListener(READY_EVENT, handleReady, false);
          childWin.removeEventListener('beforeunload', handleClose, false);
          clearInterval(closeCheckerInterval);
        };
      }
    },
    [props, isChild, name, features, handleClose]
  );

  return {
    isOpener: !isChild,
    isChild
  };
}
