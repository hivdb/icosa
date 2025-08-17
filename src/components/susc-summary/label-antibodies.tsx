import React from 'react';
import {HoverPopup} from '../popup';
import {ConfigContext} from '../report';

// Lazily load Markdown to avoid pulling heavy dependencies when the
// description message is absent. This also simplifies testing as the
// Markdown component relies on additional third-party packages.
const Markdown = React.lazy(() => import('../markdown'));

import type {Antibody} from './types';

/**
 * Props for {@link LabelAntibodies}.
 *
 * @property antibodies - List of antibodies associated with a result row.
 */
export interface LabelAntibodiesProps {
  antibodies: Antibody[];
}

/**
 * Display abbreviated antibody names with an optional description popup.
 *
 * @param props - {@link LabelAntibodiesProps}
 * @returns Rendered antibody label wrapped in a {@link HoverPopup}.
 */
export default function LabelAntibodies({antibodies}: LabelAntibodiesProps) {
  const descMsg = `mab-desc_${
    antibodies.map(({name}) => name).join('+')
  }`;
  const [config] = ConfigContext.use();

  const message = config?.messages?.[descMsg];

  return <HoverPopup message={
    message ? (
      <React.Suspense fallback={null}>
        <Markdown escapehtml={false}>{message}</Markdown>
      </React.Suspense>
    ) : null
  }>
    {antibodies
      .map(({name, abbrName}) => abbrName || name)
      .join(' + ')}
  </HoverPopup>;
}
