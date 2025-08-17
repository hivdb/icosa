import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect, vi} from 'vitest';
import React from 'react';

import useDownloadButton from './use-download-button';
import ColumnDef from './column-def';
import * as downloadUtils from '../../utils/download';

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

  it('handles copy and download options', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {clipboard: {writeText}});
    window.localStorage.removeItem('--simple-table-default-download-opt');
    window.dispatchEvent(new Event('SimpleTableDefaultDownloadOptChanged'));
    const makeDownload = vi.spyOn(downloadUtils, 'makeDownload').mockImplementation(() => undefined as any);

    function Wrapper() {
      const tableRef = React.useRef<HTMLDivElement>(null);
      const columnDefs = [
        new ColumnDef({name: 'foo', label: 'Foo', render: v => v}),
        new ColumnDef({name: 'bar', label: 'Bar', exportCell: v => ({baz: v})})
      ];
      const {element} = useDownloadButton({columnDefs, sheetName: 's', tableRef});
      return (
        <div ref={tableRef}>
          <table>
            <thead><tr><th>Foo</th><th>Bar</th></tr></thead>
            <tbody>
              <tr data-payload='{"foo":"a","bar":1}'>
                <td>a</td><td>1</td>
              </tr>
            </tbody>
          </table>
          {element}
        </div>
      );
    }
    render(<Wrapper />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('More options'));
      fireEvent.click(screen.getByText('Copy to clipboard'));
      await vi.runAllTimersAsync();
    });
    expect(writeText).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('More options'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Download CSV'));
      await vi.runAllTimersAsync();
    });
    expect(makeDownload).toHaveBeenCalledWith(expect.stringContaining('datasheet.csv'), expect.any(String), expect.any(String));

    await act(async () => {
      fireEvent.click(screen.getByLabelText('More options'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Download Excel'));
      await vi.runAllTimersAsync();
    });
    expect(makeDownload).toHaveBeenCalledWith(expect.stringContaining('datasheet.xlsx'), null, expect.anything(), true);

    vi.useRealTimers();
  });

  it('processes complex export data and skips rows', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {clipboard: {writeText}});

    function Wrapper() {
      const tableRef = React.useRef<HTMLDivElement>(null);
      const columnDefs = [
        new ColumnDef({name: 'arr', exportCell: () => [{x: 1}, {"": 2}]}),
        new ColumnDef({name: 'obj', exportCell: () => ({a: 1, "": 2})}),
        new ColumnDef({name: 'val', exportCell: v => v}),
        new ColumnDef({name: 'empty', exportCell: () => ''})
      ];
      const {element} = useDownloadButton({columnDefs, sheetName: 's', tableRef});
      return (
        <div ref={tableRef}>
          <table>
            <thead>
              <tr>
                <th>Arr</th>
                <th>Obj</th>
                <th>Val</th>
                <th>Empty</th>
              </tr>
            </thead>
            <tbody>
              <tr data-payload='{"arr":1,"obj":1,"val":"v","empty":""}'>
                <td>1</td><td>1</td><td>v</td><td></td>
              </tr>
              <tr data-skip-copy data-payload='{"arr":2,"obj":2,"val":"w","empty":""}'>
                <td>2</td><td>2</td><td>w</td><td></td>
              </tr>
            </tbody>
          </table>
          {element}
        </div>
      );
    }
    render(<Wrapper />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('More options'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Copy to clipboard'));
      await vi.runAllTimersAsync();
    });

    const text = writeText.mock.calls[0][0];
    expect(text).toContain('Arr: x');
    expect(text).toContain('Obj: a');
    expect(text).toContain('Val');
    expect(text).not.toContain('Empty');

    vi.useRealTimers();
  });
});
