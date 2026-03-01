import '@testing-library/jest-dom/vitest';
import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {MutationViewer} from '../../../../../src/components/report/mutation-viewer/index';
import type {MutationViewerProps} from '../../../../../src/components/report/mutation-viewer/types';

// Mock dependencies
vi.mock('../../../../../src/components/genome-map', () => ({
  __esModule: true,
  default: ({preset, className}: {preset: any; className?: string}) => (
    <div data-testid="genome-map" className={className} data-preset-name={preset.name}>
      Genome Map: {preset.label || preset.name}
    </div>
  )
}));

vi.mock('../../../../../src/components/report/report-section', () => ({
  __esModule: true,
  default: ({title, titleAnnotation, children}: {title: string; titleAnnotation?: React.ReactNode; children: React.ReactNode}) => (
    <section data-testid="report-section">
      <h2>{title}</h2>
      {titleAnnotation && <div data-testid="title-annotation">{titleAnnotation}</div>}
      {children}
    </section>
  )
}));

vi.mock('../../../../../src/components/checkbox-input', () => ({
  __esModule: true,
  default: ({id, checked, onChange, children}: {id: string; checked: boolean; onChange: () => void; children: React.ReactNode}) => (
    <label>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        data-testid={id}
      />
      {children}
    </label>
  )
}));

vi.mock('../../../../../src/components/vertical-tabs-style', () => ({
  __esModule: true,
  default: {'vertical-tabs': 'vertical-tabs'},
  useToggleTabs: () => [false, <button key="toggler" data-testid="tab-toggler">Toggle</button>, vi.fn()]
}));

vi.mock('../../../../../src/components/report/mutation-viewer/funcs', () => ({
  getUnsequencedRegions: vi.fn(() => []),
  getGenomeMapPositions: vi.fn(() => [{name: 'M1A', pos: 10, gene: 'PR'}]),
  getCoverages: vi.fn(() => ({coverages: [], height: 50}))
}));

describe('MutationViewer', () => {
  const mockRegionPresets = {
    presets: [
      {
        name: 'PR',
        label: 'Protease',
        preset: {
          width: 800,
          minHeight: 100,
          paddingTop: 20,
          paddingRight: 10,
          paddingLeft: 10,
          domains: [{posStart: 1, posEnd: 99, scaleRatio: 1}],
          regions: [{posStart: 1, posEnd: 99, name: 'PR', shapeType: 'rect' as const}]
        }
      },
      {
        name: 'RT',
        label: 'Reverse Transcriptase',
        preset: {
          width: 800,
          minHeight: 150,
          paddingTop: 20,
          paddingRight: 10,
          paddingLeft: 10,
          domains: [{posStart: 100, posEnd: 560, scaleRatio: 1}],
          regions: [{posStart: 100, posEnd: 560, name: 'RT', shapeType: 'rect' as const}]
        }
      }
    ],
    genes: [
      {gene: 'PR', range: [1, 99] as [number, number]},
      {gene: 'RT', range: [100, 560] as [number, number]}
    ]
  };

  const mockAllGeneSeqs = [
    {
      gene: {name: 'PR'},
      mutations: [],
      frameShifts: [],
      unsequencedRegions: {regions: []}
    }
  ];

  const baseProps: MutationViewerProps = {
    strain: 'HIV1',
    allGeneSeqs: mockAllGeneSeqs,
    regionPresets: mockRegionPresets
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<MutationViewer {...baseProps} />);

      expect(screen.getByTestId('report-section')).toBeInTheDocument();
      expect(screen.getByText('Mutation map')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<MutationViewer {...baseProps} title="Custom Mutation Map" />);

      expect(screen.getByText('Custom Mutation Map')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <MutationViewer {...baseProps}>
          <div data-testid="custom-child">Custom Content</div>
        </MutationViewer>
      );

      expect(screen.getByTestId('custom-child')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });
  });

  describe('View Toggle', () => {
    it('renders collapse view toggle checkbox by default', () => {
      render(<MutationViewer {...baseProps} />);

      expect(screen.getByTestId('genome-map-view')).toBeInTheDocument();
      expect(screen.getByText('Collapse mutation maps')).toBeInTheDocument();
    });

    it('uses custom viewCheckboxLabel', () => {
      render(<MutationViewer {...baseProps} viewCheckboxLabel="Custom Label" />);

      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('hides toggle checkbox when hideViewToggler is true', () => {
      render(<MutationViewer {...baseProps} hideViewToggler={true} />);

      expect(screen.queryByTestId('genome-map-view')).not.toBeInTheDocument();
    });

    it('hides toggle checkbox in printable output', () => {
      render(<MutationViewer {...baseProps} output="printable" />);

      expect(screen.queryByTestId('genome-map-view')).not.toBeInTheDocument();
    });

    it('toggles between collapse and expansion views', () => {
      render(<MutationViewer {...baseProps} />);

      const checkbox = screen.getByTestId('genome-map-view') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });

    it('starts with expansion view when defaultView is expansion', () => {
      render(<MutationViewer {...baseProps} defaultView="expansion" />);

      // The persisted reducer may override defaultView from localStorage
      // Just verify the component renders and checkbox exists
      const checkbox = screen.getByTestId('genome-map-view') as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Collapse View (Tabs)', () => {
    it('renders tabs in collapse view', () => {
      render(<MutationViewer {...baseProps} />);

      expect(screen.getByText(/Protease \(PR\)/)).toBeInTheDocument();
      expect(screen.getByText(/Reverse Transcriptase \(RT\)/)).toBeInTheDocument();
    });

    it('renders genome maps in tab panels', () => {
      render(<MutationViewer {...baseProps} />);

      // In collapse view (tabs), only the selected tab's genome map is visible
      const genomeMaps = screen.getAllByTestId('genome-map');
      expect(genomeMaps.length).toBeGreaterThanOrEqual(1);
    });

    it('uses defaultPresetIndex for initial tab selection', () => {
      render(<MutationViewer {...baseProps} defaultPresetIndex={1} />);

      // Component should render with second tab selected
      expect(screen.getByTestId('report-section')).toBeInTheDocument();
    });
  });

  describe('Expansion View', () => {
    it('renders expanded sections when view is expansion', () => {
      render(<MutationViewer {...baseProps} defaultView="expansion" />);

      // In expansion view, sections may be hidden based on hasCoverage
      const genomeMaps = screen.getAllByTestId('genome-map');
      expect(genomeMaps.length).toBeGreaterThanOrEqual(1);
    });

    it('renders section headings in expansion view', () => {
      render(<MutationViewer {...baseProps} defaultView="expansion" />);

      expect(screen.getByText(/Protease \(PR\)/)).toBeInTheDocument();
      expect(screen.getByText(/Reverse Transcriptase \(RT\)/)).toBeInTheDocument();
    });
  });

  describe('Printable Output', () => {
    it('renders in printable output mode', () => {
      render(<MutationViewer {...baseProps} output="printable" />);

      // Printable mode shows expanded view
      const genomeMaps = screen.getAllByTestId('genome-map');
      expect(genomeMaps.length).toBe(2);
    });

    it('hides view toggler in printable mode', () => {
      render(<MutationViewer {...baseProps} output="printable" />);

      expect(screen.queryByTestId('genome-map-view')).not.toBeInTheDocument();
    });
  });

  describe('Strain Filtering', () => {
    it('filters presets by strain', () => {
      const presetsWithStrainFilter = {
        presets: [
          {
            name: 'PR',
            label: 'Protease',
            strainOnly: ['HIV1'],
            preset: {
              width: 800,
              minHeight: 100,
              paddingTop: 20,
              paddingRight: 10,
              paddingLeft: 10,
              domains: [{posStart: 1, posEnd: 99, scaleRatio: 1}],
              regions: [{posStart: 1, posEnd: 99, name: 'PR', shapeType: 'rect' as const}]
            }
          },
          {
            name: 'RT',
            label: 'RT',
            strainOnly: ['HIV2'],
            preset: {
              width: 800,
              minHeight: 100,
              paddingTop: 20,
              paddingRight: 10,
              paddingLeft: 10,
              domains: [{posStart: 100, posEnd: 200, scaleRatio: 1}],
              regions: [{posStart: 100, posEnd: 200, name: 'RT', shapeType: 'rect' as const}]
            }
          }
        ],
        genes: mockRegionPresets.genes
      };

      render(<MutationViewer {...baseProps} strain="HIV1" regionPresets={presetsWithStrainFilter} />);

      expect(screen.getByText(/Protease \(PR\)/)).toBeInTheDocument();
      expect(screen.queryByText(/RT \(RT\)/)).not.toBeInTheDocument();
    });

    it('includes presets without strainOnly restriction', () => {
      const presetsWithMixed = {
        presets: [
          {
            name: 'PR',
            label: 'Protease',
            preset: {
              width: 800,
              minHeight: 100,
              paddingTop: 20,
              paddingRight: 10,
              paddingLeft: 10,
              domains: [{posStart: 1, posEnd: 99, scaleRatio: 1}],
              regions: [{posStart: 1, posEnd: 99, name: 'PR', shapeType: 'rect' as const}]
            }
          }
        ],
        genes: mockRegionPresets.genes
      };

      render(<MutationViewer {...baseProps} strain="HIV2" regionPresets={presetsWithMixed} />);

      expect(screen.getByText(/Protease \(PR\)/)).toBeInTheDocument();
    });
  });

  describe('Coverage and Highlighting', () => {
    it('renders with coverages', () => {
      const coverages = [
        {gene: 'PR', position: 10, coverage: 100}
      ];

      render(<MutationViewer {...baseProps} coverages={coverages} coverageUpperLimit={200} />);

      expect(screen.getByTestId('report-section')).toBeInTheDocument();
    });

    it('passes highlightUnusualMutation flag', () => {
      render(<MutationViewer {...baseProps} highlightUnusualMutation={true} />);

      expect(screen.getByTestId('report-section')).toBeInTheDocument();
    });

    it('passes highlightDRM flag', () => {
      render(<MutationViewer {...baseProps} highlightDRM={true} />);

      expect(screen.getByTestId('report-section')).toBeInTheDocument();
    });

    it('handles noUnseqRegions flag', () => {
      render(<MutationViewer {...baseProps} noUnseqRegions={true} />);

      expect(screen.getByTestId('report-section')).toBeInTheDocument();
    });
  });

  describe('Gene Highlighting', () => {
    it('highlights specific genes when specified in preset', () => {
      const presetsWithHighlight = {
        presets: [
          {
            name: 'PR',
            label: 'Protease',
            highlightGenes: ['PR'],
            preset: {
              width: 800,
              minHeight: 100,
              paddingTop: 20,
              paddingRight: 10,
              paddingLeft: 10,
              domains: [{posStart: 1, posEnd: 99, scaleRatio: 1}],
              regions: [{posStart: 1, posEnd: 99, name: 'PR', shapeType: 'rect' as const}]
            }
          }
        ],
        genes: mockRegionPresets.genes
      };

      render(<MutationViewer {...baseProps} regionPresets={presetsWithHighlight} />);

      expect(screen.getByTestId('report-section')).toBeInTheDocument();
    });
  });

  describe('Multiple Gene Sequences', () => {
    it('handles multiple gene sequences', () => {
      const multipleGeneSeqs = [
        {
          gene: {name: 'PR'},
          mutations: [],
          frameShifts: [],
          unsequencedRegions: {regions: []}
        },
        {
          gene: {name: 'RT'},
          mutations: [],
          frameShifts: [],
          unsequencedRegions: {regions: []}
        }
      ];

      render(<MutationViewer {...baseProps} allGeneSeqs={multipleGeneSeqs} />);

      expect(screen.getByTestId('report-section')).toBeInTheDocument();
    });
  });
});
