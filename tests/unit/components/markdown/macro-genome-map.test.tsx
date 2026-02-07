import React from 'react';
import {render} from '@testing-library/react';
import GenomeMapNodeWrapper, {genomemapMacro} from '../../../../src/components/markdown/macro-genome-map';
import type {Preset} from '../../../../src/genome-map/types';

const preset: Preset = {
  name: 'foo',
  label: 'Foo',
  width: 200,
  height: 100,
  paddingTop: 0,
  paddingLeft: 0,
  paddingRight: 0,
  domains: [{posStart: 0, posEnd: 10, scaleRatio: 1}],
  positionGroups: [{name: 'g', positions: []}],
  regions: [],
  hidePositionAxis: true
};

describe('GenomeMapNodeWrapper', () => {
  it('renders genome map when preset exists', () => {
    const Wrapper = GenomeMapNodeWrapper({genomeMaps: {foo: preset}});
    const {container} = render(<Wrapper mapName="foo" props={{}} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders error when preset missing', () => {
    const Wrapper = GenomeMapNodeWrapper({genomeMaps: {}});
    const {getByText} = render(<Wrapper mapName="bar" props={{}} />);
    expect(getByText(/genome-map data of bar is not found/i)).toBeTruthy();
  });

  it('registers genomemap macro', () => {
    const node = genomemapMacro(' foo ', {a: 1});
    expect(node).toEqual({type: 'GenomeMapNode', mapName: 'foo', props: {a: 1}});
  });
});
