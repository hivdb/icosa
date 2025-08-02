import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import Loader from './index';

describe('Loader', () => {
  it('renders four child divs', () => {
    const {container} = render(<Loader />);
    expect(container.firstChild?.childNodes).toHaveLength(4);
  });
});
