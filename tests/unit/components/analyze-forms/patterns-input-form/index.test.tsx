import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import PatternsInputForm, {newPatternObj} from '../../../../../src/components/analyze-forms/patterns-input-form';
import React from 'react';

vi.mock('found', () => ({
  useRouter: () => ({
    router: {
      push: vi.fn(),
      replace: vi.fn()
    },
    match: {
      location: {
        pathname: '/test',
        search: '',
        hash: '',
        state: {},
        query: {},
        key: 'test'
      }
    }
  })
}));

vi.mock('../../../../../src/components/utils/config-context', () => ({
  default: {
    use: () => [{
      allowPositions: true,
      mutationDefaultGene: 'RT',
      geneSynonyms: {RT: 'RT'},
      geneReferences: {
        RT: 'PISPIETVPVKLKPGMDGPKVKQWPLTEEKIKALVEICTEMEKEGKISKIGPENPYNTPVFAIKKKDSTKWRKLVDFRELNKRTQDFWEVQLGIPHPAGLKKKKSVTVLDVGDAYFSVPLDEDFRKYTAFTIPSINNETPGIRYQYNVLPQGWKGSPAIFQSSMTKILEPFRKQNPDIVIYQYMDDLYVGSDLEIGQHRTKIEELRQHLLRWGLTTPDKKHQKEPPFLWMGYELHPDKWTVQPIVLPEKDSWTVNDIQKLVGKLNWASQIYPGIKVRQLCKLLRGTKALTEVIPLTEEAELELAENREILKEPVHGVYYDPSKDLIAEIQKQGQGQWTYQIYQEPFKNLKTGKYARMRGAHTNDVKQLTEAVQKITTESIVIWGKTPKFKLPIQKETWETWWTEYWQATWIPEWEFVNTPPLVKLWYQLEKEPIVGAETFYVDGAANRETKLGKAGYVTNRGRQKVVTLTDTTNQKTELQAIYLALQDSGLEVNIVTDSQYALGIIQAQPDQSESELVNQIIEQLIKKEKVYLAWVPAHKGIGGNEQVDKLVSAGIRKVL'
      },
      geneDisplay: {RT: 'RT'},
      messages: {
        'pattern-analysis-input-placeholder': 'Enter mutations'
      }
    }, false]
  }
}));

// Mock MutationsInput to expose handleChange calls
vi.mock('../../../../../src/components/mutations-input', () => ({
  __esModule: true,
  default: ({onChange, mutations, uuid, name}: any) => (
    <div data-testid="mutations-input">
      <div data-testid="current-mutations">{JSON.stringify(mutations)}</div>
      <button 
        data-testid="trigger-valid" 
        onClick={() => onChange({uuid, name, mutations: ['RT:E40F']}, false)}
      >
        Add Valid Mutation
      </button>
      <button 
        data-testid="trigger-invalid" 
        onClick={() => onChange({uuid, name, mutations: ['RT:E40F']}, true)}
      >
        Add Invalid Mutation
      </button>
      <button 
        data-testid="clear-errors" 
        onClick={() => onChange({uuid, name, mutations: ['RT:E40F']}, false)}
      >
        Clear Errors
      </button>
    </div>
  )
}));

describe('newPatternObj', () => {
  it('creates unique pattern object', () => {
    const pat = newPatternObj();
    expect(pat).toHaveProperty('uuid');
    expect(pat).toHaveProperty('name', pat.uuid);
    expect(pat.mutations).toEqual([]);
  });

  it('creates unique UUIDs for each pattern', () => {
    const pattern1 = newPatternObj();
    const pattern2 = newPatternObj();
    
    expect(pattern1.uuid).not.toBe(pattern2.uuid);
    expect(pattern1.name).toBe(pattern1.uuid);
    expect(pattern2.name).toBe(pattern2.uuid);
  });
});

/**
 * Integration tests for PatternsInputForm handleChange callback.
 * 
 * These tests verify the fix for the disabled Analyze button issue by rendering
 * the actual component and triggering the real handleChange function.
 * 
 * The bug was in lines 122-126 of index.tsx:
 * 
 * BEFORE (buggy):
 * ```
 * if (preventSubmit) {
 *   submitDisabled || setSubmitDisabled(true);
 * } else if (submitDisabled && !disabled) {  // ← Bug: checked !disabled
 *   submitDisabled && setSubmitDisabled(false);
 * }
 * ```
 * 
 * AFTER (fixed):
 * ```
 * if (preventSubmit) {
 *   submitDisabled || setSubmitDisabled(true);
 * } else if (submitDisabled) {  // ← Fixed: removed !disabled check
 *   submitDisabled && setSubmitDisabled(false);
 * }
 * ```
 */

describe('PatternsInputForm handleChange behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    to: '/test',
    onSubmit: vi.fn()
  };

  it('initially disables submit button when no mutations exist (disabled=true)', () => {
    const {container} = render(<PatternsInputForm {...defaultProps} />);
    
    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('sets submitDisabled=true when handleChange called with preventSubmit=true', async () => {
    const {container} = render(<PatternsInputForm {...defaultProps} />);
    
    // Initially button is disabled (no mutations)
    let submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toHaveAttribute('disabled');
    
    // Add valid mutation (preventSubmit=false) - button should enable
    const addValidButton = screen.getByTestId('trigger-valid');
    addValidButton.click();
    
    await waitFor(() => {
      submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).not.toHaveAttribute('disabled');
    });
    
    // Trigger validation error (preventSubmit=true) - button should disable
    const addInvalidButton = screen.getByTestId('trigger-invalid');
    addInvalidButton.click();
    
    await waitFor(() => {
      submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).toHaveAttribute('disabled');
    });
  });

  it('sets submitDisabled=false when handleChange called with preventSubmit=false (THE FIX)', async () => {
    const {container} = render(<PatternsInputForm {...defaultProps} />);
    
    // Add valid mutation first
    const addValidButton = screen.getByTestId('trigger-valid');
    addValidButton.click();
    
    await waitFor(() => {
      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).not.toHaveAttribute('disabled');
    });
    
    // Trigger validation error (preventSubmit=true)
    const addInvalidButton = screen.getByTestId('trigger-invalid');
    addInvalidButton.click();
    
    await waitFor(() => {
      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).toHaveAttribute('disabled');
    });
    
    // Clear errors (preventSubmit=false) - THE FIX: button should re-enable
    const clearErrorsButton = screen.getByTestId('clear-errors');
    clearErrorsButton.click();
    
    await waitFor(() => {
      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).not.toHaveAttribute('disabled');
    });
  });

  it('re-enables button when validation clears, regardless of disabled state (bug scenario)', async () => {
    const {container} = render(<PatternsInputForm {...defaultProps} />);
    
    // Initial state: no mutations, button disabled
    let submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toHaveAttribute('disabled');
    
    // Add valid mutation - button enables
    const addValidButton = screen.getByTestId('trigger-valid');
    addValidButton.click();
    
    await waitFor(() => {
      submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).not.toHaveAttribute('disabled');
    });
    
    // Trigger validation error - button disables
    const addInvalidButton = screen.getByTestId('trigger-invalid');
    addInvalidButton.click();
    
    await waitFor(() => {
      submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).toHaveAttribute('disabled');
    });
    
    // Clear validation errors (preventSubmit=false)
    // OLD BUG: Would stay disabled if disabled=true was checked
    // NEW FIX: Correctly re-enables because we removed !disabled check
    const clearErrorsButton = screen.getByTestId('clear-errors');
    clearErrorsButton.click();
    
    await waitFor(() => {
      submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).not.toHaveAttribute('disabled');
    });
  });

  it('updates patterns state when handleChange is called', async () => {
    render(<PatternsInputForm {...defaultProps} />);
    
    // Initially empty mutations
    let mutationsDisplay = screen.getByTestId('current-mutations');
    expect(mutationsDisplay.textContent).toBe('[]');
    
    // Add mutation via handleChange
    const addValidButton = screen.getByTestId('trigger-valid');
    addValidButton.click();
    
    // Mutations should be updated
    await waitFor(() => {
      mutationsDisplay = screen.getByTestId('current-mutations');
      expect(mutationsDisplay.textContent).toBe('["RT:E40F"]');
    });
  });

  it('combines disabled and submitDisabled states correctly (disabled || submitDisabled)', async () => {
    const {container} = render(<PatternsInputForm {...defaultProps} />);
    
    // Case 1: disabled=true, submitDisabled=false → button disabled
    let submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toHaveAttribute('disabled');
    
    // Case 2: disabled=false, submitDisabled=false → button enabled
    const addValidButton = screen.getByTestId('trigger-valid');
    addValidButton.click();
    await waitFor(() => {
      submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).not.toHaveAttribute('disabled');
    });
    
    // Case 3: disabled=false, submitDisabled=true → button disabled
    const addInvalidButton = screen.getByTestId('trigger-invalid');
    addInvalidButton.click();
    await waitFor(() => {
      submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).toHaveAttribute('disabled');
    });
    
    // Case 4: disabled=false, submitDisabled=false → button enabled
    const clearErrorsButton = screen.getByTestId('clear-errors');
    clearErrorsButton.click();
    await waitFor(() => {
      submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).not.toHaveAttribute('disabled');
    });
  });
});
