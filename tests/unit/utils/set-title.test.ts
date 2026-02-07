import {describe, expect, it} from 'vitest';
import setTitle from '../../../src/utils/set-title';

describe('setTitle', () => {
  it('updates document title with suffix', () => {
    setTitle('Home');
    expect(document.title).toBe(
      'Home - Stanford Coronavirus Antiviral & Resistance Database (CoVDB)'
    );
    setTitle();
    expect(document.title).toBe(
      'Stanford Coronavirus Antiviral & Resistance Database (CoVDB)'
    );
  });
});
