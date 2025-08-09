import React from 'react';

import Collapsable from '../collapsable';
import {HeadingTag} from '../heading-tags';
import References, {
  InlineRef,
  useAutoUpdate,
  ReferenceContext,
  LoadExternalRefData
} from '../references';

import macroPlugin from './macro-plugin';

/** Register the `refs` macro allowing static reference lists. */
macroPlugin.addMacro('refs', (content: string, props: Record<string, unknown>) => ({
  type: 'StaticRefsNode',
  names: (
    content.split(/[\r\n]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0)
  ),
  ...props
}));

export interface StaticRefsNodeProps {
  /** List of reference names to render. */
  names: string[];
  /** HTML tag to render as, defaults to `ul`. */
  as?: 'ul' | 'ol';
  /** Optional CSS class name. */
  className?: string;
  /** Inline style object. */
  style?: React.CSSProperties;
}

/**
 * Render a static list of references specified by name. Each name is resolved
 * using {@link InlineRef}.
 */
export function StaticRefsNode({names, as = 'ul', className, style}: StaticRefsNodeProps) {
  if (as !== 'ul' && as !== 'ol') {
    as = 'ul';
  }

  return React.createElement(
    as,
    {className, style},
    names.map(name => (
      <li key={name}>
        <InlineRef name={name} />
      </li>
    ))
  );
}

export interface OptReferencesProps {
  /** Heading level for the reference section. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Disable anchor links on the heading tag. */
  disableAnchor?: boolean;
  /** Title displayed above the references list. */
  referenceTitle?: React.ReactNode;
}

/**
 * Conditionally render the list of references if any have been registered
 * within the current {@link ReferenceContext}.
 */
  interface ReferenceContextValue {
    hasAnyReference: (includeInlines?: boolean) => boolean;
  }

  export default function OptReferences({
    level = 2,
    disableAnchor,
    referenceTitle
  }: OptReferencesProps) {
    const {hasAnyReference} = React.useContext(
      ReferenceContext as React.Context<ReferenceContextValue>
    );
  useAutoUpdate();

  if (hasAnyReference(/* includeInlines= */true)) {
    const hasFootnoteReferences = hasAnyReference(/* includeInlines= */false);
      return <>
        <LoadExternalRefData />
        {hasFootnoteReferences ?
          <Collapsable.Section
            level={level}
            alwaysCollapsable
            data-section-reference="">
            {() => <>
              <HeadingTag {...{disableAnchor, level}}>
                {referenceTitle}
              </HeadingTag>
              <References />
            </>}
          </Collapsable.Section> :
          null}
      </>;
  }
  return null;
}
