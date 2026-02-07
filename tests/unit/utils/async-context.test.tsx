import {render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import AsyncContext from '../../../src/utils/async-context';

describe('AsyncContext', () => {
  it('loads value asynchronously', async () => {
    const {Provider, use} = AsyncContext<{foo: string}>({foo: 'default'});
    function Child() {
      const [val] = use();
      return <div>{val ? val.foo : 'loading'}</div>;
    }
    render(
      <Provider value={async () => ({foo: 'bar'})}>
        <Child />
      </Provider>
    );
    await waitFor(() => screen.getByText('bar'));
  });
});
