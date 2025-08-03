import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../styles/globals.scss', () => ({}), {virtual: true});
vi.mock('./style.module.scss', () => ({default: {}}), {virtual: true});

import Layout from './index';

describe('Layout', () => {
  it('renders children and home link', () => {
    render(<Layout><div>Child</div></Layout>);
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute('href', '/');
  });
});
