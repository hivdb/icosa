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

/**
 * Build an AST node descriptor for the `refs` macro allowing static lists.
 *
 * @param content - Newline separated reference names.
 * @param props - Additional properties to mix into the node.
 * @returns Node descriptor consumed by the macro plugin.
 */
export function refsMacro(content: string, props: Record<string, unknown>) {
  const val = {
    type: 'StaticRefsNode',
    names: content
      .split(/[\r\n]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0),
    ...props
  };
  return val;
}

macroPlugin.addMacro('refs', refsMacro);

export interface StaticRefsNodeProps {
  /** List of reference names to render, JSON encoded. */
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
  const parsedNames: string[] = names;
  if (as !== 'ul' && as !== 'ol') {
    as = 'ul';
  }

  return React.createElement(
    as,
    {className, style},
    parsedNames.map(name => (
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
export default function OptReferences({
  level = 2,
  disableAnchor,
  referenceTitle
}: OptReferencesProps): JSX.Element | null {
  const refContext = React.useContext(ReferenceContext);
  const hasAnyReference = refContext?.hasAnyReference ?? (() => false);

  useAutoUpdate();

  if (hasAnyReference(true)) {
    const hasFootnoteReferences = hasAnyReference(false);
    return (
      <>
        <LoadExternalRefData />
        {hasFootnoteReferences ? (
          <Collapsable.Section
            level={level}
            alwaysCollapsable
            data-section-reference=""
          >
            {() => (
              <>
                <HeadingTag {...{ disableAnchor, level }}>
                  {referenceTitle}
                </HeadingTag>
                <References />
              </>
            )}
          </Collapsable.Section>
        ) : null}
      </>
    );
  }
  return null;
}
