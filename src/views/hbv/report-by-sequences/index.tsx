import React, {ReactElement} from 'react';
import useApolloClient from '../apollo-client';
import useExtendVariables from '../use-extend-variables';

import ConfigContext from '../../../utils/config-context';
import SeqLoader, {useWhenNoSequence} from '../../../components/sequence-loader';
import SeqAnalysisLayout from
  '../../../components/sequence-analysis-layout';

import query from './query.graphql';
import SeqReports from './reports';

interface ReportBySequencesContainerProps {
  config?: Record<string, any>;
  lazyLoad: boolean;
  output?: string;
  match: any;
  sequences: any[];
  currentSelected?: any;
}

/**
 * Render sequence analysis reports for HBV sequences.
 *
 * @param props - {@link ReportBySequencesContainerProps} with configuration.
 * @returns Rendered sequence analysis layout.
 */
function ReportBySequencesContainer({
  config,
  lazyLoad,
  output,
  match,
  sequences,
  currentSelected
}: ReportBySequencesContainerProps): ReactElement | null {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(
      'Begin rendering ReportBySequenceContainer',
      (new Date()).getTime()
    );
  }

  if (!config) {
    return null;
  }

  const client = useApolloClient({
    payload: sequences,
    config
  });
  const onExtendVariables = useExtendVariables({
    config: config as {allGenes: string[]}
  });

  return <SeqAnalysisLayout
   query={query}
   client={client}
   sequences={sequences}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   extraParams={`
     $includeGenes: [EnumGene!]!
   `}
   onExtendVariables={onExtendVariables}>
    {props => (
      <SeqReports
       cmtVersion={config.cmtVersion}
       output={output}
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
 *
 * @param props - {@link WrapperProps} containing router and match.
 * @returns The sequence report container.
 */
export default function ReportBySequencesContainerWrapper(props: WrapperProps): ReactElement {
  const {
    location: {
      pathname,
      query: {
        output = 'default'
      } = {}
    } = {},
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

