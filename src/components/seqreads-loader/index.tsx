import React from 'react';
import {useRouter} from 'found';

import Loader from '../loader';

import ConfigContext from '../../utils/config-context';

import useAllSeqReads, {useWhenNoSeqReads} from './use-all-seq-reads';

export {useWhenNoSeqReads};

interface SeqRead {name: string; [key: string]: any;}

  interface CurrentSelected {index: number; name: string;}
  type MaybeCurrentSelected = CurrentSelected | Record<string, never>;

  /**
   * Determine which sequence read is currently selected.
   *
   * @param lazyLoad - Whether sequence reads are loaded lazily via query.
   * @param allSequenceReads - Array of available sequence reads.
   * @returns The current selection with index and name or an empty object when
   *   no reads are available.
   */
  function useCurrentSelected({
    lazyLoad,
    allSequenceReads
  }: {lazyLoad: boolean; allSequenceReads: SeqRead[]}): MaybeCurrentSelected {
  const {
    match: {location = {query: {}}}
  } = useRouter();

  return React.useMemo(
    () => {
        if (!allSequenceReads || allSequenceReads.length === 0) {
          return {} as Record<string, never>;
        }
        if (!lazyLoad) {
          return {index: 0, name: allSequenceReads[0].name};
        }

      const name = (location as any).query.name;
      if (!name) {
        return {index: 0, name: allSequenceReads[0].name};
      }
      const index = Math.max(
        0,
        allSequenceReads.findIndex(({name: seqH}) => seqH === name)
      );
      return {index, name: allSequenceReads[index].name};
    },
    [lazyLoad, allSequenceReads, (location as any).query.name]
  );
}

/**
 * Load sequence reads and pass them to a render prop child.
 */
interface SeqReadsLoaderProps {
  lazyLoad: boolean;
  defaultParams: Record<string, unknown>;
  childProps?: Record<string, unknown>;
  children: (args: {
    allSequenceReads: SeqRead[];
    currentSelected: MaybeCurrentSelected;
  }) => React.ReactElement;
}

function SeqReadsLoader({
  lazyLoad,
  defaultParams,
  childProps = {},
  children
}: SeqReadsLoaderProps) {
  const [allSequenceReads, isPending] = useAllSeqReads({
    defaultParams
  }) as [SeqRead[], boolean];
  const currentSelected = useCurrentSelected({
    lazyLoad,
    allSequenceReads
  });
  if (isPending) {
    return <Loader modal />;
  }
  else {
    return children({
      ...childProps,
      allSequenceReads,
      currentSelected
    });
  }
}

/**
 * Wrapper that reads configuration before loading sequence reads.
 */
interface SeqReadsLoaderWrapperProps extends Omit<SeqReadsLoaderProps, 'defaultParams'> {}

function SeqReadsLoaderWrapper(props: SeqReadsLoaderWrapperProps) {
  const [config, isPending] = ConfigContext.use() as any;

  if (isPending) {
    return <Loader modal />;
  }

  const {seqReadsDefaultParams: defaultParams} = config;

  return (
    <SeqReadsLoader
     {...props}
     defaultParams={defaultParams}
    />
  );
}

export default SeqReadsLoaderWrapper;
