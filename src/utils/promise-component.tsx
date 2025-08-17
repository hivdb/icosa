import React from 'react';
import Loader from '../components/loader';
import sleep from 'sleep-promise';

/**
 * Properties for {@link PromiseComponent}.
 *
 * @template T Result type of the provided promise.
 * @template P Props type passed to `component` when supplied.
 */
export interface PromiseComponentProps<T = unknown, P = any> {
  /**
   * A promise-like value or plain result to resolve before rendering.
   */
  promise: Promise<T> | T;
  /**
   * Callback transforming the resolved value before rendering.
   *
   * @param value - Resolved value from `promise`.
   * @returns Renderable content or props for `component`.
   */
  then?: (value: T) => React.ReactNode | P;
  /**
   * Callback transforming an error should the promise reject.
   *
   * @param err - Error thrown while awaiting the promise.
   * @returns Renderable error content or props for `component`.
   */
  error?: (err: unknown) => React.ReactNode | P;
  /**
   * Optional component to render with props returned from `then`/`error`.
   */
  component?: React.ComponentType<P>;
  /**
   * Fallback content displayed while waiting for the promise to settle.
   */
  children?: React.ReactNode;
}

/**
 * Render asynchronous content resolved from a promise.
 *
 * While the promise is pending, the `children` placeholder is displayed
 * (defaulting to {@link Loader}).  Once the promise settles, the resolved
 * value is passed through `then` or `error` and rendered either directly or
 * via the optional `component` prop.
 *
 * @returns A React element representing the resolved content.
 */
export default function PromiseComponent<T = unknown, P = any>({
  promise,
  then = (value: T) => value as React.ReactNode,
  error = (err: unknown) => err as React.ReactNode,
  component,
  children = <Loader />
}: PromiseComponentProps<T, P>): React.ReactElement {
  const [childProps, setChildProps] = React.useState<P | null>(null);
  const [rendered, setRendered] = React.useState<React.ReactNode>(children);
  const loadedRef = React.useRef<Promise<T> | T | false>(false);

  React.useEffect(() => {
    const isPromise =
      typeof (promise as any)?.then === 'function' &&
      promise !== loadedRef.current;

    if (isPromise) {
      loadedRef.current = false;
      (async () => {
        try {
          const result = await promise as T;
          const processed = then(result);
          if (component) {
            setChildProps(processed as P);
          } else {
            setRendered(processed as React.ReactNode);
          }
          loadedRef.current = promise;
        } catch (e) {
          const processed = error(e);
          if (component) {
            setChildProps(processed as P);
          } else {
            setRendered(processed as React.ReactNode);
          }
          loadedRef.current = promise;
        }
      })();
    } else if (loadedRef.current !== promise) {
      const processed = then(promise as T);
      if (component) {
        setChildProps(processed as P);
      } else {
        setRendered(processed as React.ReactNode);
      }
      loadedRef.current = promise;
    }
  }, [promise, then, error, component]);

  if (component && childProps) {
    const Component = component;
    return <Component {...childProps} />;
  }

  return <>{rendered}</>;
}

/**
 * Props for {@link AsyncComponent}.
 */
export interface AsyncComponentProps {
  /**
    * Renderable child generated after the artificial delay.
    */
  children: () => React.ReactElement;
  /**
    * Duration in milliseconds to wait before rendering `children`.
    */
  duration?: number;
}

/**
 * Convenience wrapper around {@link PromiseComponent} which resolves after a
 * specified timeout and then renders its children.
 *
 * @returns A React element that appears once the delay has elapsed.
 */
export function AsyncComponent({
  children,
  duration = 0
}: AsyncComponentProps): React.ReactElement {
  const thenRender = React.useCallback(() => children(), [children]);
  const promise = React.useMemo(() => sleep(duration), [duration]);
  return <PromiseComponent promise={promise} then={thenRender} />;
}

