import React from 'react';
import { useRouter } from 'found';

import ReferenceContext, { useReference } from './reference-context';
import RefDefinition from './reference-definition';
import buildRef, { BuildRefProps } from './build-ref';
import style from './style.module.scss';
import LoadExternalRefData from './load-references';
import InlineRef from './inline-reference';
import { focusElement } from './funcs';
import useAutoUpdate from './use-auto-update';

import Loader from '../loader';

export {
  ReferenceContext,
  useAutoUpdate,
  useReference,
  InlineRef,
  RefDefinition,
  LoadExternalRefData
};

export { default as RefLink } from './reference-link';

interface RefItemProps extends BuildRefProps {
  number: number;
  itemId: string;
  linkIds: string[];
}

/**
 * Renders an individual reference list item including back links to the
 * citation locations.
 */
function RefItem({ number, itemId, linkIds, ...rest }: RefItemProps) {
  const itemRef = React.useRef<HTMLLIElement>(null);

  React.useEffect(() => {
    setTimeout(() => {
      const elem = itemRef.current;
      if (!elem) {
        return;
      }
      let anchor = window.location.hash;
      if (anchor) {
        anchor = anchor.slice(1);
        if (anchor.length > 0 && anchor === elem.id) {
          focusElement(elem);
        }
      }
    });
  });

  const { match: { location }, router } = useRouter<any>();

  const handleClick = React.useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault();
      const { href } = evt.currentTarget;
      const anchor = href.slice(1);
      router.push({
        ...location,
        hash: `#${anchor}`
      });
      setTimeout(() => {
        const elem = document.getElementById(anchor);
        focusElement(elem!);
      });
    },
    [location, router]
  );

  const children = buildRef(rest);
  const multiLinks = linkIds.length > 1;
  if (linkIds.length === 0) {
    return null;
  }
  return (
    <li id={`ref__${itemId}`} ref={itemRef}>
      {multiLinks ? (
        <>
          <span>^</span>{' '}
        </>
      ) : null}
      {linkIds.map((linkId, idx) => [
        <a
          key={idx}
          className={style['cite-back-link']}
          onClick={handleClick}
          href={`#${linkId}`}
        >
          {multiLinks ? <sup>{number}.{idx + 1}</sup> : '^'}
        </a>,
        ' '
      ])}
      {children}
    </li>
  );
}

interface ReferencesProps {
  placeholder?: React.ReactNode;
}

/**
 * Displays all registered references in an ordered list.
 */
export default function References({
  placeholder = <Loader inline />
}: ReferencesProps) {
  const { ensureLoaded } = React.useContext(ReferenceContext as any);
  useAutoUpdate();

  return (
    <ol className={style.references}>
      {ensureLoaded(
        ({ getLinkedReferences }: any) =>
          getLinkedReferences().map((refProps: any) => (
            <RefItem {...refProps} key={refProps.itemId} />
          )),
        placeholder
      )}
    </ol>
  );
}
