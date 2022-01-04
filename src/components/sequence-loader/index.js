import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import FixedLoader from '../fixed-loader';
import BigData from '../../utils/big-data';


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
  let [sequences, isPending] = BigData.use(key);
  return React.useMemo(
    () => {
      if (isPending) {
        return [undefined, true];
      }
      else {
        return [
          // eslint-disable-next-line no-unused-vars
          sequences.map(({size, ...seq}) => seq),
          false
        ];
      }
    },
    [sequences, isPending]
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
    return <FixedLoader />;
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
