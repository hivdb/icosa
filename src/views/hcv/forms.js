import React from 'react';
import PropTypes from 'prop-types';
import {routerShape, matchShape} from 'found';

import ConfigContext from '../../utils/config-context';
import {getFullLink} from '../../utils/cms';
import setTitle from '../../utils/set-title';
import AnalyzeForms, {useBasePath} from '../../components/analyze-forms';
import Intro, {IntroHeader} from '../../components/intro';
import HCVTabularReportBySequences, {
  subOptions as sequenceSubOptions
} from './tabular-report-by-sequences';

function Forms({config, curAnalysis, match, router}) {
  const basePath = useBasePath(match.location);
  const title = config.messages[`${curAnalysis}-form-title`];
  setTitle(title);

  return <>
    <Intro>
      <IntroHeader><h1>{title}</h1></IntroHeader>
      <p>{config.messages[`${curAnalysis}-form-desc`]}</p>
    </Intro>
    <AnalyzeForms
     basePath={basePath}
     match={match}
     router={router}
     enableTabs={['patterns', 'sequences']}
     patternsTo={`${basePath}/by-patterns/report/`}
     sequencesTo={`${basePath}/by-sequences/report/`}
     sequencesOutputOptions={{
       __printable: {
         label: 'Printable HTML'
       },
       csv: {
         label: 'Machine-readable data (CSV/JSON)',
         subOptions: sequenceSubOptions,
         defaultSubOptions: sequenceSubOptions.map((_, idx) => idx),
         renderer: props => <HCVTabularReportBySequences
          patternsTo={`${basePath}/by-patterns/report/`}
          {...props} />
       }
     }}
     exampleFasta={config.sequenceExamples.map(({url, title}) => ({
       url: getFullLink(url, config), title
     }))} />
  </>;
}

Forms.propTypes = {
  config: PropTypes.object.isRequired,
  curAnalysis: PropTypes.string.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired
};

export default function FormsWithConfig(props) {
  return <ConfigContext.Consumer>
    {config => <Forms {...props} config={config} />}
  </ConfigContext.Consumer>;
}
