import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import PageBreak from './index';
import style from './style.module.scss';

describe('PageBreak', () => {
  it('renders a div with page-break class', () => {
    const {container} = render(<PageBreak />);
    const div = container.firstElementChild as HTMLElement;
    expect(div).toHaveClass(style['page-break']);
  });
});

