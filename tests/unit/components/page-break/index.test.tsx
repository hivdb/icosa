import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import PageBreak from '../../../../src/components/page-break';
import style from '../../../../src/components/page-break/style.module.scss';

describe('PageBreak', () => {
  it('renders a div with page-break class', () => {
    const {container} = render(<PageBreak />);
    const div = container.firstElementChild as HTMLElement;
    expect(div).toHaveClass(style['page-break']);
  });
});

