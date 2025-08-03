import React, {useEffect} from 'react';
import {render, act, fireEvent} from '@testing-library/react';
jest.mock('use-persisted-state', () => {
  const React = require('react');
  const store: Record<string, any> = {};
  return (key: string) => {
    return (initial: any) => {
      const [state, setState] = React.useState(
        key in store ? store[key] : initial
      );
      const setPersistedState = (val: any) => {
        store[key] = val;
        setState(val);
      };
      return [state, setPersistedState];
    };
  };
}, {virtual: true});

import nl2br from '../nl2br';
import useMounted, {useMountedCallback} from '../use-mounted';
import useSmartAsync from '../use-smart-async';
import useMessages, {loadMessages, loadMessage} from '../use-messages';
import {ConsecutiveGroupsByNumber} from '../array-groups';
import {csvEscape, csvUnescape, csvParse, csvStringify, tsvStringify} from '../csv';
import setTitle from '../set-title';
import shortenMutationList, {Mutation} from '../shorten-mutation-list';
import readFile from '../read-file';
import {gzip} from 'pako';
const createPersistedReducer = require('../use-persisted-reducer').default;

describe('utility functions and hooks', () => {
  test('nl2br converts newlines to <br />', () => {
    const result = nl2br('a\nb');
    expect(result).toHaveLength(3);
    expect((result[1] as any).type).toBe('br');
  });

  test('useMountedCallback does not run after unmount', () => {
    let calls = 0;
    let saved: () => void = () => {};
    function Comp() {
      const cb = useMountedCallback(() => {
        calls += 1;
      }, []);
      useEffect(() => {
        saved = cb;
      }, [cb]);
      return null;
    }
    const {unmount} = render(<Comp />);
    act(() => saved());
    expect(calls).toBe(1);
    unmount();
    act(() => saved());
    expect(calls).toBe(1);
  });

  test('useMounted returns current mount state', () => {
    function Comp() {
      const isMounted = useMounted();
      useEffect(() => {
        expect(isMounted()).toBe(true);
      }, [isMounted]);
      return null;
    }
    const {unmount} = render(<Comp />);
    unmount();
  });

  // test('useSmartAsync resolves data', async () => {
  //   function Comp({value}: {value: string}) {
  //     const {data} = useSmartAsync({promiseFn: async () => value, value});
  //     return <div>{data || 'loading'}</div>;
  //   }
  //   const {findByText, rerender} = render(<Comp value="A" />);
  //   await findByText('A');
  //   rerender(<Comp value="A" />);
  //   await findByText('A');
  // });

  test('useMessages loads messages', () => {
    const dict = {a: 'hello'};
    expect(loadMessage('a', dict)).toBe('hello');
    expect(loadMessages(['a', 'b'], dict)).toEqual(['hello', '<b>']);
    function Comp() {
      const [msgA, msgB] = useMessages(['a', 'b'], dict);
      return (
        <>
          <span>{msgA}</span>
          <span>{msgB}</span>
        </>
      );
    }
    const {getAllByText} = render(<Comp />);
    expect(getAllByText(/hello|<b>/)).toHaveLength(2);
  });

  test('createPersistedReducer persists state', () => {
    const useReducer = createPersistedReducer<number, number>('test-key');
    function Comp() {
      const [count, dispatch] = useReducer((s, a) => s + a, 0);
      return <button onClick={() => dispatch(1)}>{count}</button>;
    }
    const {getByText, unmount} = render(<Comp />);
    fireEvent.click(getByText('0'));
    expect(getByText('1')).toBeTruthy();
    unmount();
    // re-render to ensure persisted state
    const {getByText: getByText2} = render(<Comp />);
    expect(getByText2('1')).toBeTruthy();
  });

  test('ConsecutiveGroupsByNumber groups numbers', () => {
    const groups = Array.from(ConsecutiveGroupsByNumber([1, 2, 3, 5, 7, 8]));
    expect(groups).toEqual([[1, 2, 3], [5], [7, 8]]);
  });

  test('csv utilities work', () => {
    const row = {a: '1,2', b: 'b'};
    const csv = csvStringify(row, {header: ['a', 'b']});
    expect(csv).toBe('"1,2",b');
    const parsed = csvParse('a,b\n1,2,b', true) as any[];
    expect(parsed[0].a).toBe('1');
    expect(csvUnescape(csvEscape('test'))).toBe('test');
    expect(tsvStringify(['a', 'b'])).toBe('a\tb');
  });

  test('setTitle sets document title', () => {
    setTitle('Hello');
    expect(document.title).toContain('Hello');
  });

  test('shortenMutationList merges deletions', () => {
    const muts: Mutation[] = [
      {AAs: '-', text: 'del', reference: 'A', position: 1, isUnsequenced: false},
      {AAs: '-', text: 'del', reference: 'B', position: 2, isUnsequenced: false},
      {AAs: 'A', text: 'A3', reference: 'A', position: 3, isUnsequenced: false}
    ];
    const result = shortenMutationList(muts);
    expect(result[0].text).toBe('Δ1-2');
    expect(result[1].text).toBe('A3');
  });

  // test('readFile reads plain and gz files', async () => {
  //   const textFile = new File(['hello'], 'a.txt', {type: 'text/plain'});
  //   await expect(readFile(textFile)).resolves.toBe('hello');
  //   const gz = gzip('hello');
  //   const gzFile = new File([gz], 'a.txt.gz', {type: 'application/x-gzip'});
  //   await expect(readFile(gzFile)).resolves.toBe('hello');
  // });
});

