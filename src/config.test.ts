import config from './config';
import {describe, it, expect} from 'vitest';

describe('config', () => {
  it('has mutationGenePattern', () => {
    expect(config).toHaveProperty('mutationGenePattern');
  });
});
