import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import ReferencesSection, {RefContextWrapper} from '../../../../src/components/report/references';
import ConfigContext from '../../../../src/utils/config-context';
import ReferenceContext, {ReferenceObject} from '../../../../src/components/references/reference-context';

test('RefContextWrapper renders children after config load', async () => {
  render(
    <ConfigContext.Provider value={{}}>
      <RefContextWrapper>
        <div>wrapped</div>
      </RefContextWrapper>
    </ConfigContext.Provider>
  );
  await screen.findByText('wrapped');
});

test('ReferencesSection renders when references exist', () => {
  const ctx = {
    hasAnyReference: () => true,
    listenOnUpdate: () => undefined,
    ensureLoaded: (cb: any) => cb({getLinkedReferences: () => []})
  } as unknown as ReferenceObject;
  render(
    <ReferenceContext.Provider value={ctx}>
      <ReferencesSection />
    </ReferenceContext.Provider>
  );
  expect(screen.getByText('References')).toBeInTheDocument();
});

test('ReferencesSection returns null when no references', () => {
  const ctx = {
    hasAnyReference: () => false,
    listenOnUpdate: () => undefined,
    ensureLoaded: (cb: any) => cb({getLinkedReferences: () => []})
  } as unknown as ReferenceObject;
  const {container} = render(
    <ReferenceContext.Provider value={ctx}>
      <ReferencesSection />
    </ReferenceContext.Provider>
  );
  expect(container.firstChild).toBeNull();
});
