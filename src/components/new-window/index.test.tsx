import React from 'react';
import {render} from '@testing-library/react';

import {NewWindowRoute} from './index';

function Dummy() {
  return <div>dummy</div>;
}

test('NewWindowRoute wraps component with popup path', () => {
  const element = (
    <NewWindowRoute pathPrefix="test" overrideProps={{foo: 'bar'}} Component={Dummy} />
  ) as any;
  expect(element.props.path).toBe('test/popup/');
  const Child = element.props.render({props: {a: 1}});
  render(Child);
  expect(Child.props.overrideProps).toEqual({foo: 'bar'});
});
