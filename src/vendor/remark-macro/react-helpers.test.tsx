import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { putRawProps } from './raw-store';
import { withMacroRawProps } from './react-helpers';

function Dump(props: any) {
  return <div data-json={JSON.stringify(props)}>{String(props.label)}</div>;
}

describe('withMacroRawProps', () => {
  it('merges raw props back into component props (raw takes precedence)', () => {
    const raw = { names: ['a', 'b'], nested: { x: 1 }, label: 'raw' };
    const id = putRawProps(raw);
    const Comp = withMacroRawProps(Dump);
    const outer = { __rawId: id, label: 'outer', unrelated: 42 };
    const { getByText } = render(<Comp {...outer} />);
    expect(getByText('raw')).toBeTruthy();
    const json = JSON.parse(getByText('raw').getAttribute('data-json') || '{}');
    expect(json.names).toEqual(['a', 'b']);
    expect(json.nested).toEqual({ x: 1 });
    expect(json.unrelated).toBe(42);
  });

  it('passes through props when no __rawId provided', () => {
    const Comp = withMacroRawProps(Dump);
    const { getByText } = render(<Comp label="plain" foo={1} />);
    expect(getByText('plain')).toBeTruthy();
    const json = JSON.parse(getByText('plain').getAttribute('data-json') || '{}');
    expect(json.foo).toBe(1);
    expect(json.label).toBe('plain');
  });
});
