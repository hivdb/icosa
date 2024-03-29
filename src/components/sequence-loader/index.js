import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import Loader from '../loader';
import BigData, {isBigData} from '../../utils/big-data';


function useCurrentSelected({
  lazyLoad,
  sequences
}) {
  const {
    match: {location = {query: {}}}
  } = useRouter();

  return React.useMemo(
    () => {
      if (!sequences || sequences.length === 0) { return {}; }
      if (!lazyLoad) { return sequences[0]; }

      const name = location.query.name;
      if (!name) {
        return {index: 0, name: sequences[0].header};
      }
      const index = Math.max(
        0,
        sequences.findIndex(({header: seqH}) => seqH === name)
      );
      return {index, name: sequences[index].header};
    },
    [lazyLoad, sequences, location.query.name]
  );
}


export function useWhenNoSequence(callback) {
  const {
    match: {
      location: {
        state: {
          sequences: key
        } = {}
      } = {}
    }
  } = useRouter();
  if (!isBigData(key)) {
    callback();
  }

}


function useSequences() {
  const {
    match: {
      location: {
        state: {
          sequences: key
        } = {}
      } = {}
    }
  } = useRouter();
  let sequences = [];
  let isPending = true;
  try {
    [sequences, isPending] = BigData.use(key);
  }
  catch (Error) {
    // skip
  }
  const constSeqs = sequences;
  return React.useMemo(
    () => {
      if (isPending) {
        return [undefined, true];
      }
      else {
        return [
          // eslint-disable-next-line no-unused-vars
          constSeqs.map(({size, ...seq}) => seq),
          false
        ];
      }
    },
    [constSeqs, isPending]
  );
}


function SequenceLoader({
  children,
  childProps = {},
  lazyLoad
}) {
  const [sequences, isPending] = useSequences();
  const currentSelected = useCurrentSelected({
    lazyLoad, sequences
  });

  if (isPending) {
    return <Loader modal />;
  }

  return children({
    ...childProps,
    sequences,
    currentSelected
  });

}

SequenceLoader.propTypes = {
  children: PropTypes.func.isRequired,
  childProps: PropTypes.object,
  lazyLoad: PropTypes.bool.isRequired
};

export default SequenceLoader;
