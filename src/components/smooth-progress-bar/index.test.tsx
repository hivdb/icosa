import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import SmoothProgressBar from './index';

describe('SmoothProgressBar', () => {
  it('renders progress text', () => {
    const {container} = render(
      <SmoothProgressBar
        loaded={true}
        progress={10}
        nextProgress={10}
        total={100}
        progressText={(p) => <span>{p}</span>}
      />
    );
    expect(container.querySelector('span')?.textContent).toBe('10');
  });
});
