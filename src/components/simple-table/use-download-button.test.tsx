import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect} from 'vitest';
import React from 'react';

import useDownloadButton from './use-download-button';
import ColumnDef from './column-def';

describe('useDownloadButton', () => {
  it('shows copy button by default', () => {
    function Wrapper() {
      const tableRef = React.useRef<HTMLDivElement>(null);
      const columnDefs = [new ColumnDef({name: 'foo', label: 'Foo', render: v => v})];
      const {element} = useDownloadButton({columnDefs, sheetName: 's', tableRef});
      return (
        <div ref={tableRef}>
          <table><thead><tr><th>Foo</th></tr></thead><tbody></tbody></table>
          {element}
        </div>
      );
    }
    render(<Wrapper />);
    expect(screen.getByText('Copy to clipboard')).toBeInTheDocument();
  });
});
