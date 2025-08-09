import React from 'react';
import Markdown from '../../components/markdown';
import genomeMaps from './genome-maps.json';
import tableData from './table-data.json';

// Load all markdown files as raw strings eagerly at build time.
const markdownFiles = Object.values(
  import.meta.glob('./*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  })
) as string[];

const testMd = markdownFiles[0];

interface RefDataLoaderProps {
  /** Callback invoked once loading is complete. */
  onLoad: () => void;
  /** Register a reference object. */
  setReference: (name: string, ref: any, incr?: boolean) => void;
  /** List of reference descriptors. */
  references: Array<{name: string}>;
}

/**
 * Loads reference data asynchronously and notifies the parent component.
 */
function RefDataLoader({
  onLoad,
  setReference,
  references
}: RefDataLoaderProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      for (const ref of references) {
        setReference(ref.name, {...ref, children: `${ref.name}aaaa`}, false);
      }
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('Reference loaded.');
      }
      onLoad();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onLoad, setReference, references]);
  return null;
}

/**
 * Debug view for rendering markdown with reference data.
 */
export default function MarkdownDebugger() {
  return (
    <Markdown
      toc
      key={1}
      escapeHtml={false}
      tables={tableData}
      refDataLoader={RefDataLoader}
      collapsableLevels={['h3']}
      genomeMaps={genomeMaps}
    >
      {testMd}
    </Markdown>
  );
}
