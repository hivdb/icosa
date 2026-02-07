import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {vi} from 'vitest';

vi.mock('../../../../src/components/link', () => ({
  __esModule: true,
  default: ({linkStyle: _ls, ...props}: any) => <a {...props}>{props.children}</a>
}));
vi.mock('../../../../src/components/link/index', () => ({
  __esModule: true,
  default: ({linkStyle: _ls, ...props}: any) => <a {...props}>{props.children}</a>
}));
vi.mock('../../../../src/components/link/external', () => ({
  __esModule: true,
  default: ({linkStyle: _ls, ...props}: any) => <a {...props}>{props.children}</a>
}));
vi.mock('../../../../src/components/link/external/index', () => ({
  __esModule: true,
  default: ({linkStyle: _ls, ...props}: any) => <a {...props}>{props.children}</a>
}));

import SubtypeRow from '../../../../src/components/report/subtype-row';

const best = {display: 'B', referenceAccession: 'V1'};
const subtypes = [
  {
    displayWithoutDistance: 'B',
    subtype: {displayName: 'B'},
    distancePcnt: '0.1%',
    referenceAccession: 'V1',
    referenceCountry: 'USA',
    referenceYear: 2000
  }
];

describe('SubtypeRow', () => {
  test('toggles subtype details', () => {
    render(
      <dl>
        <SubtypeRow bestMatchingSubtype={best} subtypes={subtypes} />
      </dl>
    );
    expect(screen.queryByText(/best match/)).toBeNull();
    const toggle = screen.getByTitle('Show subtype details');
    fireEvent.click(toggle);
    expect(screen.getByText(/best match/)).not.toBeNull();
  });
});
