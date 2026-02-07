import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ConfigContext from '../../../../src/components/ngs2codfreq/config-context';
import NGSUploadForm from '../../../../src/components/ngs2codfreq/upload-form';
import {vi} from 'vitest';

vi.mock('../../../../src/components/link', () => ({default: () => <a>link</a>}));

function Wrapper({children}: {children: React.ReactNode}) {
  return <ConfigContext.Provider value={{messages:{}, refSequencePath:'', refSequenceName:'Ref'}}>{children}</ConfigContext.Provider>;
}

describe('NGSUploadForm component', () => {
  test('renders placeholder', async () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} onSubmit={() => {}} />, {wrapper: Wrapper});
    expect(await screen.findByText(/Browse files/i)).toBeInTheDocument();
  });
});
