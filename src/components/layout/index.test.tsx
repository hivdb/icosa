import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import Layout from './index';

describe('Layout', () => {
  it('renders children and home link', () => {
    render(<Layout><div>Child</div></Layout>);
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute('href', '/');
  });
});
