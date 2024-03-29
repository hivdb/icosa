import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import Loader from '../loader';

import ConfigContext from '../../utils/config-context';

import useAllSeqReads, {useWhenNoSeqReads} from './use-all-seq-reads';

export {useWhenNoSeqReads};


function useCurrentSelected({
  lazyLoad,
  allSequenceReads
}) {
  const {
    match: {location = {query: {}}}
  } = useRouter();

  return React.useMemo(
    () => {
      if (!allSequenceReads || allSequenceReads.length === 0) { return {}; }
      if (!lazyLoad) { return allSequenceReads[0]; }

      const name = location.query.name;
      if (!name) {
        return {index: 0, name: allSequenceReads[0].name};
      }
      const index = Math.max(
        0,
        allSequenceReads.findIndex(({name: seqH}) => seqH === name)
      );
      return {index, name: allSequenceReads[index].name};
    },
    [lazyLoad, allSequenceReads, location.query.name]
  );
}


function SeqReadsLoader(props) {
  const {
    lazyLoad,
    defaultParams,
    childProps = {},
    children
  } = props;
  const [allSequenceReads, isPending] = useAllSeqReads({
    defaultParams
  });
  const currentSelected = useCurrentSelected({
    lazyLoad, allSequenceReads
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


function SeqReadsLoaderWrapper(props) {

  const [config, isPending] = ConfigContext.use();

  if (isPending) {
    return <Loader modal />;
  }

  const {seqReadsDefaultParams: defaultParams} = config;

  return (
    <SeqReadsLoader
     {...props}
     {...{defaultParams}} />
  );
}

SeqReadsLoaderWrapper.propTypes = {
  children: PropTypes.func.isRequired,
  lazyLoad: PropTypes.bool.isRequired,
  childProps: PropTypes.object
};

export default SeqReadsLoaderWrapper;
