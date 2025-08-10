import React from 'react';
import {useRouter} from 'found';

import Loader from '../loader';
import BigData, {isBigData} from '../../utils/big-data';

interface Sequence {
  header: string;
  [key: string]: any;
}

interface CurrentSelected {
  index: number;
  name: string;
}

type MaybeCurrentSelected = CurrentSelected | Record<string, never>;

/**
 * Determine the currently selected sequence from router state.
 */
function useCurrentSelected({lazyLoad, sequences}: {lazyLoad: boolean; sequences?: Sequence[]}): MaybeCurrentSelected {
  const { match: {location = {query: {}} as any} } = useRouter();
  return React.useMemo<MaybeCurrentSelected>(() => {
    if (!sequences || sequences.length === 0) {
      return {} as Record<string, never>;
    }
    if (!lazyLoad) { return {index: 0, name: sequences[0].header}; }

    const name = (location as any).query.name;
    if (!name) {
      return {index: 0, name: sequences[0].header};
    }
    const index = Math.max(
      0,
      sequences.findIndex(({header: seqH}) => seqH === name)
    );
    return {index, name: sequences[index].header};
  }, [lazyLoad, sequences, (location as any).query.name]);
}

export function useWhenNoSequence(callback: () => void) {
  const { match: { location: { state: { sequences: key } = {} } = {} } } = useRouter();
  if (!isBigData(key)) {
    callback();
  }
}

function useSequences(): [Sequence[] | undefined, boolean] {
  const { match: { location: { state: { sequences: key } = {} } = {} } } = useRouter();
  let sequences: Sequence[] | undefined = [];
  let isPending = true;
  try {
    [sequences, isPending] = (BigData as any).use(key);
  }
  catch (Error) {
    // skip
  }
  const constSeqs = sequences;
  return React.useMemo(() => {
    if (isPending) {
      return [undefined, true] as [undefined, true];
    }
    else {
      return [
        (constSeqs || []).map(({size, ...seq}) => seq),
        false
      ] as [Sequence[], false];
    }
  }, [constSeqs, isPending]);
}

export interface SequenceLoaderProps {
  children: (props: {sequences: Sequence[]; currentSelected: CurrentSelected} & Record<string, any>) => React.ReactNode;
  childProps?: Record<string, any>;
  lazyLoad: boolean;
}

export default function SequenceLoader({
  children,
  childProps = {},
  lazyLoad
}: SequenceLoaderProps) {
  const [sequences, isPending] = useSequences();
  const currentSelected = useCurrentSelected({
    lazyLoad, sequences
  }) as CurrentSelected;

  if (isPending || !sequences) {
    return <Loader modal />;
  }

  return <>{children({
    ...childProps,
    sequences,
    currentSelected
  })}</>;
}
