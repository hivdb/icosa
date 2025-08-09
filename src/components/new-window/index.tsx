import React from 'react';
import {Route} from 'found';
import {useMountedCallback} from '../../utils/use-mounted';

const READY_EVENT = '_newwindowready';

interface NewWindowPropsProviderProps {
  routeProps: Record<string, any>;
  overrideProps?: Record<string, any>;
  Component: React.ComponentType<any>;
}

function NewWindowPropsProvider({routeProps, overrideProps, Component}: NewWindowPropsProviderProps) {
  const touched = React.useRef(false);
  const [props, setProps] = React.useState<Record<string, any>>();
  // expose a setter to the child window
  (window as any).setProps = useMountedCallback((p: Record<string, any>) => {
    touched.current = true;
    setProps(p);
  }, [setProps]);
  React.useEffect(() => {
    window.dispatchEvent(new Event(READY_EVENT));
  }, []);

  return <>{touched.current ? <Component {...routeProps} {...props} {...overrideProps} /> : null}</>;
}

interface NewWindowRouteProps {
  /** Optional prefix used to build the popup path. */
  pathPrefix?: string;
  /** Props injected into the rendered component inside the popup. */
  overrideProps?: Record<string, any>;
  /** Component rendered within the new window route. */
  Component: React.ComponentType<any>;
  [key: string]: any;
}

/**
 * Route wrapper that opens the target component in a separate browser window.
 *
 * The route path is automatically suffixed with `popup/` and the rendered
 * component receives its props via the {@link NewWindowPropsProvider}.
 */
export function NewWindowRoute({
  pathPrefix,
  overrideProps,
  Component,
  ...props
}: NewWindowRouteProps): React.ReactElement {
  const path = pathPrefix ? pathPrefix.replace(/\/*$/, '/') + 'popup/' : 'popup/';
  return (
    <Route
      {...props}
      path={path}
      render={({props: routeProps}: any) => (
        <NewWindowPropsProvider
          routeProps={routeProps}
          overrideProps={overrideProps}
          Component={Component}
        />
      )}
    />
  );
}

interface UseNewWindowOptions {
  name: string;
  onUnload?: () => void;
  features?: string;
}

interface UseNewWindowResult {
  isOpener: boolean;
  isChild: boolean;
}

export function useNewWindow(
  props: Record<string, any>,
  {name, onUnload, features}: UseNewWindowOptions
): UseNewWindowResult {
  const childWindowRef = React.useRef<Window | null>();
  const isChild = window.name === name;

  if (!isChild && !childWindowRef.current) {
    const to = window.location.pathname.replace(/\/*$/, '/') + 'popup/';
    childWindowRef.current = window.open(to, name, features);
  }

  React.useEffect(() => {
    if (!isChild) {
      return () => childWindowRef.current?.close();
    }
  }, [isChild]);

  const handleClose = React.useCallback(() => {
    onUnload && onUnload();
  }, [onUnload]);

  React.useEffect(() => {
    if (!isChild && childWindowRef.current) {
      const childWin = childWindowRef.current as any;
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
  }, [props, isChild, name, features, handleClose]);

  return {
    isOpener: !isChild,
    isChild
  };
}
