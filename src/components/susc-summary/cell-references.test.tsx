import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import CellReferences, {LabelReferences} from './cell-references';

// Stub RefLink to avoid router dependency in tests.
vi.mock('../references', () => ({
  RefLink: ({name}: any) => <span>{name}</span>
}));

describe('CellReferences', () => {
  it('renders references and toggles expansion', () => {
    const refs = [{refName: 'Ref1'}, {refName: 'Ref2'}, {refName: 'Ref3'}];
    render(<CellReferences refs={refs} />);
    expect(screen.getAllByRole('listitem').length).toBe(3);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveAttribute('data-expanded', 'true');
  });
});

describe('LabelReferences', () => {
  it('toggles label text', () => {
    render(<LabelReferences />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('show more');
    fireEvent.click(link);
    expect(link).toHaveTextContent('show less');
  });
});
