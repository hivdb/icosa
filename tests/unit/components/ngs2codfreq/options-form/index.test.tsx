import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import NGSOptionsForm from '../../../../../src/components/ngs2codfreq/options-form/index';
import type {NGSOptions} from '../../../../../src/components/ngs2codfreq/options-form/types';
import {
  defaultFastpConfig,
  defaultCutadaptConfig,
  defaultIvarConfig
} from '../../../../../src/components/ngs2codfreq/options-form/types';

// Mock dependencies
vi.mock('../../../../../src/utils/config-context', () => ({
  __esModule: true,
  default: {
    use: () => [{
      messages: {},
      refSequencePath: '/ref.fasta',
      refSequenceName: 'NC_045512'
    }]
  }
}));

vi.mock('../../../../../src/utils/use-messages', () => ({
  __esModule: true,
  default: () => ['FASTA description', 'BED description']
}));

vi.mock('../../../../../src/utils/read-file', () => ({
  __esModule: true,
  default: async () => JSON.stringify({
    fastpConfig: defaultFastpConfig,
    cutadaptConfig: defaultCutadaptConfig,
    ivarConfig: defaultIvarConfig,
    primerType: 'off'
  })
}));

vi.mock('../../../../../src/utils/download', () => ({
  makeDownload: vi.fn()
}));

vi.mock('../../../../../src/utils/use-mounted', () => ({
  __esModule: true,
  default: () => () => true
}));

describe('NGSOptionsForm', () => {
  const defaultProps: NGSOptions & {isDefault: boolean; onChange: any} = {
    isDefault: true,
    fastpConfig: defaultFastpConfig,
    cutadaptConfig: defaultCutadaptConfig,
    ivarConfig: defaultIvarConfig,
    primerType: 'off',
    saveInBrowser: false,
    onChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the form', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      expect(screen.getByText('Save below settings in my browser for future use')).toBeInTheDocument();
    });

    it('shows default settings message when isDefault is true', () => {
      render(<NGSOptionsForm {...defaultProps} isDefault={true} />);
      expect(screen.getByText('Current settings are the default settings.')).toBeInTheDocument();
    });

    it('shows non-default settings message when isDefault is false', () => {
      render(<NGSOptionsForm {...defaultProps} isDefault={false} />);
      expect(screen.getByText(/Current settings are/)).toBeInTheDocument();
      const notElements = screen.getAllByText(/not/);
      expect(notElements.length).toBeGreaterThan(0);
    });

    it('renders save in browser checkbox', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      const checkbox = screen.getByLabelText('Save below settings in my browser for future use');
      expect(checkbox).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      expect(screen.getByText('Open settings')).toBeInTheDocument();
      expect(screen.getByText('Save settings')).toBeInTheDocument();
      expect(screen.getByText('Reset all')).toBeInTheDocument();
    });
  });

  describe('Save in Browser', () => {
    it('calls onChange when save in browser checkbox is toggled', () => {
      const onChange = vi.fn();
      render(<NGSOptionsForm {...defaultProps} onChange={onChange} />);

      const checkbox = screen.getByLabelText('Save below settings in my browser for future use') as HTMLInputElement;
      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledWith('saveInBrowser', true);
    });

    it('checkbox reflects saveInBrowser prop', () => {
      render(<NGSOptionsForm {...defaultProps} saveInBrowser={true} />);
      const checkbox = screen.getByLabelText('Save below settings in my browser for future use') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Settings Management', () => {
    it('calls makeDownload when Save settings is clicked', async () => {
      const {makeDownload} = await import('../../../../../src/utils/download');
      render(<NGSOptionsForm {...defaultProps} />);

      const saveButton = screen.getByText('Save settings');
      fireEvent.click(saveButton);

      expect(makeDownload).toHaveBeenCalledWith(
        'ngs2codfreq.cdfjson',
        'application/json',
        expect.any(String)
      );
    });

    it('downloads correct JSON payload', async () => {
      const {makeDownload} = await import('../../../../../src/utils/download');
      render(<NGSOptionsForm {...defaultProps} />);

      const saveButton = screen.getByText('Save settings');
      fireEvent.click(saveButton);

      const payload = JSON.parse((makeDownload as any).mock.calls[0][2]);
      expect(payload).toHaveProperty('fastpConfig');
      expect(payload).toHaveProperty('cutadaptConfig');
      expect(payload).toHaveProperty('ivarConfig');
      expect(payload).toHaveProperty('primerType');
    });

    it('handles file upload', async () => {
      const onChange = vi.fn();
      render(<NGSOptionsForm {...defaultProps} onChange={onChange} />);

      const file = new File(['content'], 'settings.cdfjson', {type: 'application/json'});
      const input = screen.getByText('Open settings').closest('label')?.querySelector('input[type="file"]');

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false
        });
        fireEvent.change(input);

        await waitFor(() => {
          expect(onChange).toHaveBeenCalledWith('.', expect.any(Object));
        });
      }
    });

    it('shows confirmation dialog when Reset all is clicked', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      render(<NGSOptionsForm {...defaultProps} />);

      const resetButton = screen.getByText('Reset all');
      fireEvent.click(resetButton);

      expect(confirmSpy).toHaveBeenCalled();
    });

    it('resets to default when Reset all is confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const onChange = vi.fn();
      render(<NGSOptionsForm {...defaultProps} onChange={onChange} />);

      const resetButton = screen.getByText('Reset all');
      fireEvent.click(resetButton);

      expect(onChange).toHaveBeenCalledWith('.', expect.objectContaining({
        primerType: 'off'
      }));
    });

    it('does not reset when Reset all is cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const onChange = vi.fn();
      render(<NGSOptionsForm {...defaultProps} onChange={onChange} />);

      const resetButton = screen.getByText('Reset all');
      fireEvent.click(resetButton);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Adapter Trimming', () => {
    it('renders adapter trimming section', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      expect(screen.getByText(/Adapter trimming/)).toBeInTheDocument();
    });

    it('renders adapter sequence inputs', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      const labels = screen.getAllByText(/Adapter sequence/);
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });

    it('disables adapter inputs when adapter trimming is disabled', () => {
      const props = {
        ...defaultProps,
        fastpConfig: {
          ...defaultFastpConfig,
          disableAdapterTrimming: true
        }
      };
      render(<NGSOptionsForm {...props} />);

      const textareas = screen.getAllByRole('textbox');
      const adapterTextareas = textareas.filter(t => t.id.includes('adapterSequence'));
      adapterTextareas.forEach(input => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Quality Filtering', () => {
    it('renders quality filtering section', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      expect(screen.getByText(/Quality filtering/)).toBeInTheDocument();
    });

    it('renders quality filtering inputs', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      expect(screen.getByText(/Min phred score/)).toBeInTheDocument();
      expect(screen.getByText(/Max % unqualified bases/)).toBeInTheDocument();
      expect(screen.getByText(/Max # N bases/)).toBeInTheDocument();
      expect(screen.getByText(/Min average phred score/)).toBeInTheDocument();
    });

    it('disables quality filtering inputs when disabled', () => {
      const props = {
        ...defaultProps,
        fastpConfig: {
          ...defaultFastpConfig,
          disableQualityFiltering: true
        }
      };
      render(<NGSOptionsForm {...props} />);

      const sliders = screen.getAllByRole('slider');
      const qualitySliders = sliders.slice(0, 4); // First 4 are quality filtering
      qualitySliders.forEach(slider => {
        expect(slider).toBeDisabled();
      });
    });
  });

  describe('Length Filtering', () => {
    it('renders length filtering section', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      expect(screen.getByText(/Length filtering/)).toBeInTheDocument();
    });

    it('renders length filtering inputs', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      expect(screen.getByText(/Min read length/)).toBeInTheDocument();
      expect(screen.getByText(/Max read length/)).toBeInTheDocument();
    });

    it('disables length filtering inputs when disabled', () => {
      const props = {
        ...defaultProps,
        fastpConfig: {
          ...defaultFastpConfig,
          disableLengthFiltering: true
        }
      };
      render(<NGSOptionsForm {...props} />);

      const sliders = screen.getAllByRole('slider');
      // Find length filtering sliders (they come after quality filtering)
      const lengthSliders = sliders.filter((_, idx) => idx >= 4 && idx < 6);
      lengthSliders.forEach(slider => {
        expect(slider).toBeDisabled();
      });
    });
  });

  describe('Primer Trimming - Off', () => {
    it('renders primer trimming section', () => {
      render(<NGSOptionsForm {...defaultProps} primerType="off" />);
      const labels = screen.getAllByText(/Primer trimming/);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('shows off message when primer type is off', () => {
      render(<NGSOptionsForm {...defaultProps} primerType="off" />);
      expect(screen.getByText(/Primer trimming is turned off/)).toBeInTheDocument();
    });

    it('does not render primer inputs when off', () => {
      render(<NGSOptionsForm {...defaultProps} primerType="off" />);
      expect(screen.queryByText('Upload FASTA')).not.toBeInTheDocument();
      expect(screen.queryByText('Upload BED')).not.toBeInTheDocument();
    });
  });

  describe('Primer Trimming - FASTA', () => {
    it('renders FASTA primer input when primerType is fasta', () => {
      const props = {
        ...defaultProps,
        primerType: 'fasta' as const
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText('Upload FASTA')).toBeInTheDocument();
    });

    it('shows primer count for FASTA primers', () => {
      const props = {
        ...defaultProps,
        primerType: 'fasta' as const,
        cutadaptConfig: {
          ...defaultCutadaptConfig,
          primerSeqs: [
            {idx: 0, header: 'P1', sequence: 'ACGT', type: 'five-end' as const},
            {idx: 1, header: 'P2', sequence: 'TGCA', type: 'three-end' as const}
          ]
        }
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText(/2 primer sequences are uploaded/)).toBeInTheDocument();
    });

    it('shows scroll message for many FASTA primers', () => {
      const props = {
        ...defaultProps,
        primerType: 'fasta' as const,
        cutadaptConfig: {
          ...defaultCutadaptConfig,
          primerSeqs: Array.from({length: 5}, (_, i) => ({
            idx: i,
            header: `P${i}`,
            sequence: 'ACGT',
            type: 'five-end' as const
          }))
        }
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText(/Scroll up\/down to view them all/)).toBeInTheDocument();
    });

    it('renders cutadapt configuration inputs for FASTA', () => {
      const props = {
        ...defaultProps,
        primerType: 'fasta' as const
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText(/Error tolerance/)).toBeInTheDocument();
      expect(screen.getByText(/Indels/)).toBeInTheDocument();
      expect(screen.getByText(/Max # matched primers/)).toBeInTheDocument();
      expect(screen.getByText(/Min matching length/)).toBeInTheDocument();
    });
  });

  describe('Primer Trimming - BED', () => {
    it('renders BED primer input when primerType is bed', () => {
      const props = {
        ...defaultProps,
        primerType: 'bed' as const
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText(/Upload BED/)).toBeInTheDocument();
    });

    it('shows primer count for BED primers', () => {
      const props = {
        ...defaultProps,
        primerType: 'bed' as const,
        ivarConfig: {
          ...defaultIvarConfig,
          primerBeds: [
            {idx: 0, region: 'NC_045512', start: 10, end: 30, name: 'P1', score: 60, strand: '+' as const},
            {idx: 1, region: 'NC_045512', start: 40, end: 60, name: 'P2', score: 60, strand: '-' as const}
          ]
        }
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText(/2 primer locations are uploaded/)).toBeInTheDocument();
    });

    it('shows scroll message for many BED primers', () => {
      const props = {
        ...defaultProps,
        primerType: 'bed' as const,
        ivarConfig: {
          ...defaultIvarConfig,
          primerBeds: Array.from({length: 5}, (_, i) => ({
            idx: i,
            region: 'NC_045512',
            start: i * 20,
            end: i * 20 + 20,
            name: `P${i}`,
            score: 60,
            strand: '+' as const
          }))
        }
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText(/Scroll up\/down to view them all/)).toBeInTheDocument();
    });

    it('does not render cutadapt inputs for BED', () => {
      const props = {
        ...defaultProps,
        primerType: 'bed' as const
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.queryByText('Error tolerance')).not.toBeInTheDocument();
    });
  });

  describe('Additional Options', () => {
    it('renders poly-G trimming option', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      expect(screen.getByText(/Poly-G trimming/)).toBeInTheDocument();
    });

    it('renders unpaired reads option', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      expect(screen.getByText(/Unpaired reads/)).toBeInTheDocument();
    });

    it('renders external links', () => {
      render(<NGSOptionsForm {...defaultProps} />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Primer Type Switching', () => {
    it('switches between primer types', () => {
      const {rerender} = render(<NGSOptionsForm {...defaultProps} primerType="off" />);
      expect(screen.getByText(/Primer trimming is turned off/)).toBeInTheDocument();

      rerender(<NGSOptionsForm {...defaultProps} primerType="fasta" />);
      expect(screen.getByText(/Upload FASTA/)).toBeInTheDocument();

      rerender(<NGSOptionsForm {...defaultProps} primerType="bed" />);
      expect(screen.getByText(/Upload BED/)).toBeInTheDocument();
    });
  });

  describe('Singular vs Plural Text', () => {
    it('uses singular form for 1 FASTA primer', () => {
      const props = {
        ...defaultProps,
        primerType: 'fasta' as const,
        cutadaptConfig: {
          ...defaultCutadaptConfig,
          primerSeqs: [
            {idx: 0, header: 'P1', sequence: 'ACGT', type: 'five-end' as const}
          ]
        }
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText(/1 primer sequence is uploaded/)).toBeInTheDocument();
    });

    it('uses singular form for 1 BED primer', () => {
      const props = {
        ...defaultProps,
        primerType: 'bed' as const,
        ivarConfig: {
          ...defaultIvarConfig,
          primerBeds: [
            {idx: 0, region: 'NC_045512', start: 10, end: 30, name: 'P1', score: 60, strand: '+' as const}
          ]
        }
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText(/1 primer location is uploaded/)).toBeInTheDocument();
    });

    it('uses plural form for 0 FASTA primers', () => {
      const props = {
        ...defaultProps,
        primerType: 'fasta' as const,
        cutadaptConfig: {
          ...defaultCutadaptConfig,
          primerSeqs: []
        }
      };
      render(<NGSOptionsForm {...props} />);
      expect(screen.getByText(/0 primer sequences are uploaded/)).toBeInTheDocument();
    });
  });

  describe('Form Structure', () => {
    it('renders multiple fieldsets', () => {
      const {container} = render(<NGSOptionsForm {...defaultProps} />);
      const fieldsets = container.querySelectorAll('fieldset');
      expect(fieldsets.length).toBeGreaterThan(3);
    });

    it('renders form element', () => {
      const {container} = render(<NGSOptionsForm {...defaultProps} />);
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });
});
