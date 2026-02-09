import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, test, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockMatch = {
  location: {
    state: {savedData: 'test'},
    pathname: '/analyze',
    query: {}
  }
};

vi.mock('found', () => ({
  useRouter: () => ({
    match: mockMatch,
    router: {push: mockPush, replace: mockReplace}
  })
}));

import AnalyzeBaseForm from '../../../../src/components/analyze-forms/base';

describe('AnalyzeBaseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders children and buttons', () => {
    render(
      <AnalyzeBaseForm
       to="/result"
       onSubmit={async () => [true, {}, {}]}
       onReset={() => {}}
       resetDisabled={false}
       submitDisabled={false}>
        <div>Form Content</div>
      </AnalyzeBaseForm>
    );
    expect(screen.getByText('Form Content')).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  test('renders children as function with saved input', () => {
    render(
      <AnalyzeBaseForm
       to="/result"
       onSubmit={async () => [true, {}, {}]}
       onReset={() => {}}
       resetDisabled={false}
       submitDisabled={false}>
        {(state: any) => <div>Saved: {state.savedData}</div>}
      </AnalyzeBaseForm>
    );
    expect(screen.getByText('Saved: test')).toBeInTheDocument();
  });

  test('handles submit with validation success', async () => {
    const onSubmit = vi.fn(async () => [true, {data: 'test'}, {param: 'value'}]);
    render(
      <AnalyzeBaseForm
       to="/result"
       onSubmit={onSubmit}
       onReset={() => {}}
       resetDisabled={false}
       submitDisabled={false}>
        <div>Content</div>
      </AnalyzeBaseForm>
    );

    const submitBtn = screen.getByText('Analyze');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/result',
          state: {data: 'test'},
          query: {param: 'value'}
        })
      );
    });
  });

  test('handles submit with outputOption', async () => {
    const onSubmit = vi.fn(async () => [
      true,
      {data: 'test', outputOption: 'json'},
      {}
    ]);
    render(
      <AnalyzeBaseForm
       to="/result"
       onSubmit={onSubmit}
       onReset={() => {}}
       resetDisabled={false}
       submitDisabled={false}>
        <div>Content</div>
      </AnalyzeBaseForm>
    );

    const submitBtn = screen.getByText('Analyze');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {output: 'json'}
        })
      );
    });
  });

  test('does not navigate when validation fails', async () => {
    const onSubmit = vi.fn(async () => [false, {}, {}]);
    render(
      <AnalyzeBaseForm
       to="/result"
       onSubmit={onSubmit}
       onReset={() => {}}
       resetDisabled={false}
       submitDisabled={false}>
        <div>Content</div>
      </AnalyzeBaseForm>
    );

    const submitBtn = screen.getByText('Analyze');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  test('handles reset button click', () => {
    const onReset = vi.fn();
    render(
      <AnalyzeBaseForm
       to="/result"
       onSubmit={async () => [true, {}, {}]}
       onReset={onReset}
       resetDisabled={false}
       submitDisabled={false}>
        <div>Content</div>
      </AnalyzeBaseForm>
    );

    const resetBtn = screen.getByText('Reset');
    fireEvent.click(resetBtn);

    expect(mockReplace).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/analyze',
        query: {}
      })
    );
    expect(onReset).toHaveBeenCalled();
  });

  test('disables buttons when disabled props are true', () => {
    render(
      <AnalyzeBaseForm
       to="/result"
       onSubmit={async () => [true, {}, {}]}
       onReset={() => {}}
       resetDisabled={true}
       submitDisabled={true}>
        <div>Content</div>
      </AnalyzeBaseForm>
    );

    const buttons = screen.getAllByRole('button');
    const analyzeBtn = buttons.find(btn => btn.textContent === 'Analyze');
    const resetBtn = buttons.find(btn => btn.textContent === 'Reset');
    
    expect(analyzeBtn).toBeDisabled();
    expect(resetBtn).toBeDisabled();
  });

  test('applies custom className', () => {
    const {container} = render(
      <AnalyzeBaseForm
       to="/result"
       className="custom-class"
       onSubmit={async () => [true, {}, {}]}
       onReset={() => {}}
       resetDisabled={false}
       submitDisabled={false}>
        <div>Content</div>
      </AnalyzeBaseForm>
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  test('handles outputOption default value', async () => {
    const onSubmit = vi.fn(async () => [
      true,
      {data: 'test', outputOption: 'default'},
      {}
    ]);
    render(
      <AnalyzeBaseForm
       to="/result"
       onSubmit={onSubmit}
       onReset={() => {}}
       resetDisabled={false}
       submitDisabled={false}>
        <div>Content</div>
      </AnalyzeBaseForm>
    );

    const submitBtn = screen.getByText('Analyze');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {}
        })
      );
    });
  });

  test('handles undefined outputOption', async () => {
    const onSubmit = vi.fn(async () => [true, {data: 'test'}, {}]);
    render(
      <AnalyzeBaseForm
       to="/result"
       onSubmit={onSubmit}
       onReset={() => {}}
       resetDisabled={false}
       submitDisabled={false}>
        <div>Content</div>
      </AnalyzeBaseForm>
    );

    const submitBtn = screen.getByText('Analyze');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {}
        })
      );
    });
  });
});
