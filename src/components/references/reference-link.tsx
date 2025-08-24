import React from 'react';
import { useRouter } from 'found';
import Popup from 'reactjs-popup';
import Children from 'react-children-utilities';

import ReferenceContext from './reference-context';
import InlineRef from './inline-reference';
import buildRef, { BuildRefProps } from './build-ref';
import { focusElement } from './funcs';

import style from './style.module.scss';

interface RefLinkInternalProps extends BuildRefProps {
  group?: string;
  name: string;
  refContext: any;
}

function RefLinkInternal({
  group,
  name,
  refContext: { setReference, getReference, ensureLoaded },
  ...ref
}: RefLinkInternalProps) {
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const [refObj, setRefObj] = React.useState<any>();

  // Build a stable key for the reference metadata to avoid ref identity churn
  const refKey = React.useMemo(() => {
    const entries = Object.entries(ref || {}).filter(([k, v]) => (
      k !== 'children' && typeof v !== 'function'
    ));
    try {
      return JSON.stringify(Object.fromEntries(entries));
    } catch (_e) {
      // best-effort fallback
      return entries.map(([k, v]) => `${k}:${String(v)}`).join('|');
    }
  }, [ref]);

  // Register the reference once per (name, refKey) change to prevent infinite loops
  React.useEffect(() => {
    const ro = setReference(name, ref, /* incr= */ true);
    setRefObj(ro);
    // Only re-run when the reference identity actually changes
  }, [name, refKey, setReference]);

  let number: number | undefined;
  let itemId: string | undefined;
  let linkId: string | undefined;
  let loaded = false;
  if (refObj) {
    number = refObj.number;
    itemId = refObj.itemId;
    linkId = refObj.linkId;
    loaded = true;
  }

  const elemId = group ? `${group}__${linkId}` : linkId;
  const anchorTarget = group ? `ref__${group}__${itemId}` : `ref__${itemId}`;

  React.useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        const elem = linkRef.current;
        if (!elem) {
          return;
        }
        let anchor = window.location.hash;
        if (anchor) {
          anchor = anchor.slice(1);
          if (anchor.length > 0 && anchor === elemId) {
            focusElement(elem);
          }
        }
      });
    }
  }, [loaded, elemId]);

  const handleClick = React.useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt && evt.preventDefault();
    },
    []
  );

  const { match: { location }, router } = useRouter<any>();

  const handleAnchorClick = React.useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      evt.preventDefault();
      const anchor = (evt.currentTarget as HTMLAnchorElement).href.split('#')[1];
      router.push({
        ...location,
        hash: `#${anchor}`
      });
      setTimeout(() => {
        const elem = document.getElementById(anchor);
        if (elem) {
          const parentLi = elem.closest('li');
          focusElement(parentLi as HTMLElement | null);
        }
      });
    },
    [location, router]
  );

  if (!loaded) {
    return null;
  }

  const trigger = (
    <sup>
      <a
        className={style['ref-link']}
        onClick={handleClick}
        ref={linkRef}
        id={elemId}
        href={`#${anchorTarget}`}
      >
        [{number}]
      </a>
    </sup>
  );

  return ensureLoaded(
    () => (
      <Popup
        on="click"
        position={["top center", "right center", "bottom center", "left center"]}
        className={style['ref-popup']}
        closeOnDocumentClick
        keepTooltipInside
        repositionOnResize
        trigger={trigger}
      >
        <a onClick={handleAnchorClick} href={`#${anchorTarget}`}>
          {number}
        </a>.{' '}
        {buildRef(getReference(name))}
      </Popup>
    ),
    trigger
  );
}

export interface RefLinkProps extends BuildRefProps {
  group?: string;
  name?: string;
  identifier?: string;
  year?: number | string;
  children?: React.ReactNode;
}

export default function RefLink({ group, name, identifier, ...props }: RefLinkProps) {
  const refContext = React.useContext(ReferenceContext);
  if (!refContext) {
    return null;
  }

  if (identifier && identifier.toLocaleLowerCase().endsWith('#inline')) {
    identifier = identifier.slice(0, identifier.length - 7);
    return <InlineRef group={group} name={identifier} />;
  }

  name = name || identifier;
  if (!name) {
    const { authors, year } = props as any;
    if (authors) {
      name = `${authors.split(' ', 2)[0]}${year}`;
    } else {
      name = Children.onlyText(props.children);
    }
  }

  for (const [key, val] of Object.entries(props)) {
    if (val === undefined) {
      delete (props as any)[key];
    }
  }

  return (
    <RefLinkInternal
      {...props}
      key={`${group ?? ''}${name}`}
      group={group}
      name={name}
      refContext={refContext}
    />
  );
}
