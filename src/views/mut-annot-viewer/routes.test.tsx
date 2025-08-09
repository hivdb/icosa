import React from 'react';
import {describe, it, expect, vi} from 'vitest';
import mutAnnotViewerRoutes from './index';

vi.mock('./preset-selection', () => ({default: () => null}));
vi.mock('./viewer', () => ({default: () => null}));
vi.mock('./components/viewer-footer', () => ({default: () => null}));
vi.mock('../../components/custom-colors', () => ({default: ({children}: any) => <div>{children}</div>}));
vi.mock('../../components/loader', () => ({default: () => <div /> }));
vi.mock('../../components/new-window', () => ({NewWindowRoute: () => null}));
vi.mock('./style.module.scss', () => ({default: {}}), {virtual: true});

describe('mutAnnotViewerRoutes', () => {
  it('returns a valid React element', () => {
    const route = mutAnnotViewerRoutes({presets: [{name: 'foo', display: 'Foo'}]});
    expect(React.isValidElement(route)).toBe(true);
  });
});
