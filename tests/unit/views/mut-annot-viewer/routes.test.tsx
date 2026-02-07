import React from 'react';
import {describe, it, expect, vi} from 'vitest';
import mutAnnotViewerRoutes from '../../../../src/views/mut-annot-viewer';

vi.mock('../../../../src/views/mut-annot-viewer/preset-selection', () => ({default: () => null}));
vi.mock('../../../../src/views/mut-annot-viewer/viewer', () => ({default: () => null}));
vi.mock('../../../../src/views/mut-annot-viewer/components/viewer-footer', () => ({default: () => null}));
vi.mock('../../../../src/components/custom-colors', () => ({default: ({children}: any) => <div>{children}</div>}));
vi.mock('../../../../src/components/loader', () => ({default: () => <div /> }));
vi.mock('../../../../src/components/new-window', () => ({NewWindowRoute: () => null}));
vi.mock('../../../../src/views/mut-annot-viewer/style.module.scss', () => ({default: {}}), {virtual: true});

describe('mutAnnotViewerRoutes', () => {
  it('returns a valid React element', () => {
    const route = mutAnnotViewerRoutes({presets: [{name: 'foo', display: 'Foo'}]});
    expect(React.isValidElement(route)).toBe(true);
  });
});
