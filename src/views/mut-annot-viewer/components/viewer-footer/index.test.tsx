import '@testing-library/jest-dom';
import React from 'react';
import {render} from '@testing-library/react';
import ViewerFooter, {useFootnote} from './index';

vi.mock('./style.module.scss', () => ({default: {}}), {virtual: true});
vi.mock('../../../../components/markdown', () => ({__esModule: true, default: ({children}: any) => <div>{children}</div>}));
vi.mock('../../../../components/new-window', () => ({useNewWindow: () => ({isChild: true})}));
vi.mock('../../../../components/protein-viewer', () => ({__esModule: true, default: () => <div>protein</div>}));

describe('useFootnote', () => {
  function Wrapper({args}: any) {
    const [text] = useFootnote(args);
    return <div>{text}</div>;
  }
  it('returns placeholder when no comments', () => {
    const {getByText} = render(
      <Wrapper args={{selectedPositions: [], commentLookup: {}, commentReferences: ''}} />
    );
    expect(getByText(/No comment/)).toBeInTheDocument();
  });
});

describe('ViewerFooter', () => {
  it('renders children content', () => {
    const {getByText} = render(
      <ViewerFooter sequence="ABC" selectedPositions={[]} proteinViews={[] as any} onClose={() => {}}>
        hello
      </ViewerFooter>
    );
    expect(getByText('hello')).toBeInTheDocument();
  });
});
