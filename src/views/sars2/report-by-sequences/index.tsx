import React from 'react';
import useApolloClient from '../apollo-client';
import useExtendVariables from '../use-extend-variables';

import ConfigContext from '../../../utils/config-context';
import SeqLoader, {
  useWhenNoSequence
} from '../../../components/sequence-loader';
import SeqAnalysisLayout from
  '../../../components/sequence-analysis-layout';

import query from './query.graphql';
import SeqReports from './reports';

interface ReportBySequencesContainerProps {
  /** Optional configuration. */
  config?: Record<string, any>;
  /** Lazy load results. */
  lazyLoad: boolean;
  /** Output mode. */
  output?: string;
  /** Route match object. */
  match: any;
  /** Uploaded sequences. */
  sequences: any[];
  /** Currently selected sequence. */
  currentSelected?: any;
}

/**
 * Render sequence analysis reports for individual sequences.
 */
function ReportBySequencesContainer({
  config,
  lazyLoad,
  output,
  match,
  sequences,
  currentSelected
}: ReportBySequencesContainerProps): JSX.Element {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(
      'Begin rendering ReportBySequenceContainer',
      (new Date()).getTime()
    );
  }

  const client = useApolloClient({
    payload: sequences,
    config
  });
  const onExtendVariables = useExtendVariables({
    config,
    match
  });

  return <SeqAnalysisLayout
   query={query}
   client={client}
   sequences={sequences}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   extraParams="$drdbVersion: String!, $cmtVersion: String!"
   onExtendVariables={onExtendVariables}>
    {props => (
      <SeqReports
       cmtVersion={config?.cmtVersion}
       output={output}
       match={match}
       {...props} />
    )}
  </SeqAnalysisLayout>;

}

interface WrapperProps {
  router: any;
  match: any;
}

/**
 * Wrapper that loads configuration and sequences before rendering reports.
 */
export default function ReportBySequencesContainerWrapper(props: WrapperProps): JSX.Element {
  const {
    location: {
      pathname,
      query: {
        output = 'default'
      } = {}
    } = {}
  } = props.match;

  useWhenNoSequence(() => props.router.replace({
    pathname: pathname.replace(/report\/*$/, '')
  }));

  const lazyLoad = output !== 'printable';

  return (
    <ConfigContext.Consumer>
      {config => (
        <SeqLoader lazyLoad={lazyLoad}>
          {({sequences, currentSelected}) => (
            <ReportBySequencesContainer
             {...props}
             output={output}
             lazyLoad={lazyLoad}
             sequences={sequences}
             currentSelected={currentSelected}
             config={config} />
          )}
        </SeqLoader>
      )}
    </ConfigContext.Consumer>
  );
}

