import React from 'react';
import style from './style.module.scss';
import {ObservePayload} from '../../../utils/use-scroll-observer';

/**
 * Highlight the first word of a section title.
 *
 * @param props - Component props.
 * @param props.children - Full section title text.
 * @param props.index - Section index for numbering.
 * @returns Title with the first word wrapped in an `<h1>` and the rest in a `<p>`.
 */
function HLFirstWord({children, index}: HLFirstWordProps) {
  const parts = children.split(' ');
  return (
    <>
      <h1>{index + 1}. {parts[0]}</h1>
      {parts.length > 1 ? (
        <p className={style.desc}>{parts.slice(1).join(' ')}</p>
      ) : null}
    </>
  );
}

/** Props for {@link HLFirstWord}. */
interface HLFirstWordProps {
  /** Full section title. */
  children: string;
  /** Zero-based index used for numbering. */
  index: number;
}

/**
 * Render report section headers and observe their visibility.
 *
 * @param props - Component properties.
 * @param props.output - Output mode; when `printable` observation is skipped.
 * @param props.name - Section name used for id and title.
 * @param props.index - Zero-based section index.
 * @param props.onObserve - Called with payload when header enters viewport.
 * @param props.onDisconnect - Called when header is unmounted or no longer observed.
 * @returns The rendered header element.
 */
function ReportHeader({
  output,
  name,
  index,
  onObserve,
  onDisconnect
}: ReportHeaderProps) {
  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (output === 'printable') {
      return;
    }
    const headerNode = headerRef.current;
    const payload = {
      name,
      index,
      node: headerNode ? headerNode.parentElement : null
    };
    onObserve(payload);
    return () => {
      if (onDisconnect) {
        onDisconnect(payload);
      }
    };
  }, [output, name, index, onObserve, onDisconnect]);

  return (
    <header ref={headerRef} className={style['report-header']} id={name}>
      <HLFirstWord index={index}>{name}</HLFirstWord>
    </header>
  );
}

/** Props for {@link ReportHeader}. */
export interface ReportHeaderProps {
  output: string;
  name: string;
  index: number;
  onObserve: (payload: ObservePayload) => void;
  onDisconnect?: (payload: ObservePayload) => void;
}

export default React.memo(
  ReportHeader,
  (prev, next) =>
    prev.output === next.output &&
    prev.name === next.name &&
    prev.index === next.index &&
    prev.onObserve === next.onObserve
);
