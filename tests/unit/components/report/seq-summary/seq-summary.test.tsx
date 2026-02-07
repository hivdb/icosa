import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {vi} from 'vitest';

vi.mock('found', async () => {
  const actual = await vi.importActual<any>('found');
  return {
    ...actual,
    useRouter: () => ({match: {location: {query: {}}}, router: {push: vi.fn(), createHref: vi.fn()}}),
    Link: (props: any) => <a {...props} />
  };
});

vi.mock('../../../../../src/components/report/seq-summary/pango-lineage', async () => {
  const actual = await vi.importActual<any>('../../../../../src/components/report/seq-summary/pango-lineage');
  return {
    ...actual,
    usePangoLineage: () => ({data: {lineage: 'B.1', probability: 0.5, version: 'v1'}, error: null, isPending: false})
  };
});

import DownloadConsensus from '../../../../../src/components/report/seq-summary/download-consensus';
import GeneMutations from '../../../../../src/components/report/seq-summary/gene-mutations';
import Genotype from '../../../../../src/components/report/seq-summary/genotype';
import InlineGeneRange from '../../../../../src/components/report/seq-summary/inline-gene-range';
import MaxMixtureRate from '../../../../../src/components/report/seq-summary/max-mixture-rate';
import MedianReadDepth from '../../../../../src/components/report/seq-summary/median-read-depth';
import MinCodonReads from '../../../../../src/components/report/seq-summary/min-codon-reads';
import MinPositionReads from '../../../../../src/components/report/seq-summary/min-position-reads';
import MinPrevalence from '../../../../../src/components/report/seq-summary/min-prevalence';
import MultilineGeneRange from '../../../../../src/components/report/seq-summary/multiline-gene-range';
import OutbreakInfo from '../../../../../src/components/report/seq-summary/outbreak-info';
import PangoLineage from '../../../../../src/components/report/seq-summary/pango-lineage';
import {PrettyPairwiseButton, PrettyPairwiseList} from '../../../../../src/components/report/seq-summary/pretty-pairwise';
import {SDRMButton, SDRMList} from '../../../../../src/components/report/seq-summary/sdrm-list';
import Subtype from '../../../../../src/components/report/seq-summary/subtype';
import ThresholdNomogram from '../../../../../src/components/report/seq-summary/threshold-nomogram';
import SeqSummary from '../../../../../src/components/report/seq-summary';
import ConfigContext from '../../../../../src/utils/config-context';

// Mock makeDownload
vi.mock('../../../../../src/utils/download', () => ({makeDownload: vi.fn()}));

// Mock Nomogram component used in ThresholdNomogram to avoid heavy rendering
vi.mock('../../../../../src/components/seqreads-threshold-nomogram', () => ({
  __esModule: true,
  CutoffKeyPoint: {} as any,
  default: () => <div data-testid="nomogram" />
}));

function renderWithConfig(ui: React.ReactElement, config: any = {}) {
  return render(<ConfigContext.Provider value={config}>{ui}</ConfigContext.Provider>);
}

describe('Seq Summary components', () => {
  test('DownloadConsensus renders', () => {
    render(<DownloadConsensus name="s" assembledConsensus="ACGT" maxMixtureRate={1} minPrevalence={0.1} minPositionReads={10} />);
    expect(screen.getByText('Consensus sequence')).toBeInTheDocument();
  });

  test('GeneMutations renders list', () => {
    render(<dl><GeneMutations config={{geneDisplay:{G:'GeneG'}}} geneSeq={{gene:{name:'G'}, mutations:[{isUnsequenced:false,text:'A1'}]}} /></dl>);
    expect(screen.getByText(/GeneG mutations/)).toBeInTheDocument();
  });

  test('Genotype renders', () => {
    render(<dl><Genotype config={{messages:{}}} bestMatchingSubtype={{display:'G1', referenceAccession:'V1'}} subtypes={[]} /></dl>);
    expect(screen.getByText(/G1/)).toBeInTheDocument();
  });

  test('InlineGeneRange lists genes', () => {
    render(<dl><InlineGeneRange config={{allGenes:['G'], geneDisplay:{G:'GeneG'}, highlightGenes:[]}} geneSeqs={[{gene:{name:'G'}, unsequencedRegions:{size:0, regions:[]}}]} includeGenes={['G']} /></dl>);
    expect(screen.getByText('GeneG')).toBeInTheDocument();
  });

  test('MaxMixtureRate renders dropdown', () => {
    render(<dl><MaxMixtureRate config={{messages:{}, seqReadsDefaultParams:{maxMixtureRate:0.1}, seqReadsMaxMixtureRate:[{label:'0.1', value:0.1}]}} maxMixtureRate={0.1} /></dl>);
    expect(screen.getByText('0.1')).toBeInTheDocument();
  });

  test('MedianReadDepth shows value', () => {
    render(<dl><MedianReadDepth config={{geneDisplay:{G:'GeneG'}, listReadDepthByGene:['G']}} readDepthStats={{median:100}} geneSeqs={[{gene:{name:'G'}, readDepthStats:{median:50}}]} /></dl>);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  test('MinCodonReads renders dropdown', () => {
    render(<dl><MinCodonReads config={{seqReadsDefaultParams:{minCodonReads:10}, seqReadsMinCodonReadsOptions:[{label:'10', value:10}]}} minCodonReads={10} /></dl>);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('MinPositionReads renders dropdown', () => {
    render(<dl><MinPositionReads config={{messages:{}, seqReadsDefaultParams:{minPositionReads:10}, seqReadsMinPositionReadsOptions:[{label:'10', value:10}]}} minPositionReads={10} /></dl>);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('MinPrevalence renders dropdown', () => {
    render(<dl><MinPrevalence config={{messages:{}, seqReadsDefaultParams:{minPrevalence:0.1}, seqReadsMinPrevalenceOptions:[{label:'0.1', value:0.1}]}} minPrevalence={0.1} /></dl>);
    expect(screen.getByText('0.1')).toBeInTheDocument();
  });

  test('MultilineGeneRange renders', () => {
    render(<dl><MultilineGeneRange config={{geneDisplay:{G:'GeneG'}}} geneSeq={{firstAA:1,lastAA:5,gene:{name:'G'},unsequencedRegions:{size:0,regions:[]}}} /></dl>);
    expect(screen.getByText(/codons/)).toBeInTheDocument();
  });

  test('OutbreakInfo shows lineage', () => {
    render(
      <dl>
        <OutbreakInfo
          asyncResultsURI="url"
          config={{outbreakInfo: {lineages: {results: [{name: 'B.1', total_count: 1}]}}}}
        />
      </dl>
    );
    expect(screen.getByText(/B.1/)).toBeInTheDocument();
  });

  // test('PangoLineage renders lineage', () => {
  //   render(<dl><PangoLineage asyncResultsURI="url" /></dl>);
  //   expect(screen.getByText(/B.1/)).toBeInTheDocument();
  // });

  test('PrettyPairwise components render', () => {
    render(<PrettyPairwiseButton disablePrettyPairwise={false} showPrettyPairwise togglePrettyPairwise={() => {}} />);
    expect(screen.getByText(/Pretty pairwise/)).toBeInTheDocument();
    render(<PrettyPairwiseList geneSeqs={[{gene:{name:'G'}, prettyPairwise:{positionLine:[],refAALine:[],alignedNAsLine:[],mutationLine:[]}}]} />);
    expect(screen.getByText(/Pretty pairwise of/)).toBeInTheDocument();
  });

  test('SDRM components render', () => {
    render(<SDRMButton config={{displaySDRMs:true}} disableSDRMs={false} showSDRMs toggleSDRMs={() => {}} />);
    expect(screen.getByText(/SDRMs/)).toBeInTheDocument();
    render(<dl><SDRMList config={{displaySDRMs:true}} geneSeqs={[{gene:{name:'G'}, sdrms:[{text:'A1'}]}]} /></dl>);
    expect(screen.getByText(/G SDRMs/)).toBeInTheDocument();
  });

  test('Subtype renders', () => {
    render(<dl><Subtype bestMatchingSubtype={{display:'S1', referenceAccession:'V1'}} subtypes={[]} /></dl>);
    expect(screen.getByText(/S1/)).toBeInTheDocument();
  });

  test('ThresholdNomogram renders container', () => {
    render(<ThresholdNomogram cutoffKeyPoints={[]} maxMixtureRate={0.1} minPrevalence={0.1} mixtureRate={0.05} actualMinPrevalence={0.1} />);
    expect(screen.getByTestId('nomogram')).toBeInTheDocument();
  });

  // test('SeqSummaryWrapper renders section', () => {
  //   renderWithConfig(<SeqSummary cutoffKeyPoints={[]} includeGenes={[]} availableGenes={[]} headless={false} children={[]} />);
  //   expect(screen.getByText('Sequence summary')).toBeInTheDocument();
  // });
});
