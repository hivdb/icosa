import classNames from 'classnames';
import style from './style.module.scss';

interface LoaderProps {
  /** Render as inline element instead of block. */
  inline?: boolean;
  /** Display loader as modal overlay. */
  modal?: boolean;
  /** Optional additional class name. */
  className?: string;
}

/**
 * Circular loading spinner component.
 *
 * @param props - {@link LoaderProps}
 * @returns Loader element.
 */
export default function Loader({
  inline = false,
  modal = false,
  className
}: LoaderProps) {
  return (
    <div
      className={classNames(
        style['lds-ring'],
        !modal && inline ? style['lds-ring-inline'] : null,
        modal ? style['lds-ring-modal'] : null,
        className
      )}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

