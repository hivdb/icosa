import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import PromiseComponent, {AsyncComponent} from './promise-component';

describe('PromiseComponent', () => {
  it('renders resolved value', async () => {
    const promise = Promise.resolve('hello');
    render(<PromiseComponent promise={promise} />);
    await screen.findByText('hello');
  });

  it('renders error value when promise rejects', async () => {
    const promise = Promise.reject(new Error('fail'));
    // prevent unhandled rejection warning
    promise.catch(() => undefined);
    render(
      <PromiseComponent
        promise={promise}
        error={err => (err as Error).message}
      />
    );
    await screen.findByText('fail');
  });
});

describe('AsyncComponent', () => {
  it('renders children after timeout', async () => {
    render(
      <AsyncComponent duration={0}>{() => <div>done</div>}</AsyncComponent>
    );
    await screen.findByText('done');
  });
});

