import { useEffect } from 'react';
import Markdown from '../../components/markdown';
import genomeMaps from './genome-maps.json';
import tableData from './table-data.json';

// Load markdown files as raw strings at build time.
const markdownFiles = Object.values(
  import.meta.glob('./*.md', {
    query: '?raw',
    import: 'default',
    eager: true
  })
) as string[];

const testMd = markdownFiles[0];

interface RefDataLoaderProps {
  /** Callback invoked when references have been registered. */
  onLoad: () => void;
  /** Register a reference. */
  setReference: (name: string, ref: any, incr?: boolean) => void;
  /** Available references. */
  references: Array<{name: string}>;
}

/**
 * Injects reference data after a short delay to mimic async behaviour.
 *
 * @param props - {@link RefDataLoaderProps}
 * @returns `null` once side effects are registered.
 */
function RefDataLoader({
  onLoad,
  setReference,
  references
}: RefDataLoaderProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const ref of references) {
        setReference(ref.name, {...ref, children: `${ref.name}aaaa`}, false);
      }
      onLoad();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onLoad, setReference, references]);
  return null;
}

/**
 * Alternate markdown debugger with an inline anchor for testing.
 */
export default function MarkdownDebugger2() {
  return (
    <>
      <a href="#wtf">wtf</a>
      <Markdown
        toc
        key={2}
        escapeHtml={false}
        tables={tableData}
        refDataLoader={RefDataLoader}
        genomeMaps={genomeMaps}
      >
        {testMd}
      </Markdown>
    </>
  );
}
