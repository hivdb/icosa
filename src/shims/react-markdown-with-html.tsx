import React from 'react';

/**
 * Test shim for the deprecated `react-markdown/with-html` entry.
 * It simply renders provided children or source as plain React nodes
 * without performing any markdown transformation.
 */
export default function ReactMarkdown({children, source}: any) {
  return <>{children ?? source}</>;
}
