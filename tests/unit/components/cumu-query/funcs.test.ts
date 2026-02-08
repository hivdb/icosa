import {describe, test, expect} from 'vitest';

import {calcOffsetLimit, calcInitOffsetLimit, DEFAULT_QUICKLOAD_LIMIT} from '../../../../src/components/cumu-query/funcs';

describe('cumu-query funcs', () => {
  describe('calcOffsetLimit', () => {
    test('with lazy loading and quickLoadLimit >= 3, centers around offset', () => {
      const result = calcOffsetLimit({
        size: 10,
        offset: 5,
        lazyLoad: true,
        quickLoadLimit: 5
      });
      expect(result).toEqual({loadFirstIndex: 5, offset: 3, limit: 5});
    });

    test('with lazy loading and quickLoadLimit < 3, does not center', () => {
      const result = calcOffsetLimit({
        size: 10,
        offset: 5,
        lazyLoad: true,
        quickLoadLimit: 2
      });
      expect(result).toEqual({loadFirstIndex: 5, offset: 5, limit: 2});
    });

    test('with lazy loading at beginning, does not go below 0', () => {
      const result = calcOffsetLimit({
        size: 10,
        offset: 1,
        lazyLoad: true,
        quickLoadLimit: 5
      });
      expect(result).toEqual({loadFirstIndex: 1, offset: 0, limit: 5});
    });

    test('without lazy loading, loads all from offset 0', () => {
      const result = calcOffsetLimit({
        size: 10,
        offset: 5,
        lazyLoad: false
      });
      expect(result).toEqual({loadFirstIndex: 5, offset: 0, limit: 10});
    });

    test('limits to available items when near end', () => {
      const result = calcOffsetLimit({
        size: 10,
        offset: 8,
        lazyLoad: true,
        quickLoadLimit: 5
      });
      expect(result).toEqual({loadFirstIndex: 8, offset: 6, limit: 4});
    });

    test('uses default quickLoadLimit when not provided', () => {
      const result = calcOffsetLimit({
        size: 10,
        offset: 5,
        lazyLoad: true
      });
      expect(result).toEqual({loadFirstIndex: 5, offset: 5, limit: DEFAULT_QUICKLOAD_LIMIT});
    });
  });

  describe('calcInitOffsetLimit', () => {
    test('without curIndex and not lazy, loads all items', () => {
      const result = calcInitOffsetLimit({size: 4, curIndex: null, lazyLoad: false});
      expect(result).toEqual({initOffset: 0, initLimit: 4});
    });

    test('without curIndex and lazy, loads nothing', () => {
      const result = calcInitOffsetLimit({size: 10, curIndex: null, lazyLoad: true});
      expect(result).toEqual({initOffset: 0, initLimit: 0});
    });

    test('with undefined curIndex and lazy, loads nothing', () => {
      const result = calcInitOffsetLimit({size: 10, curIndex: undefined, lazyLoad: true});
      expect(result).toEqual({initOffset: 0, initLimit: 0});
    });

    test('with curIndex and lazy loading, uses calcOffsetLimit', () => {
      const result = calcInitOffsetLimit({
        size: 10,
        curIndex: 5,
        lazyLoad: true,
        quickLoadLimit: 3
      });
      expect(result).toEqual({initOffset: 4, initLimit: 3});
    });

    test('with curIndex and not lazy, loads all items', () => {
      const result = calcInitOffsetLimit({
        size: 10,
        curIndex: 5,
        lazyLoad: false
      });
      expect(result).toEqual({initOffset: 0, initLimit: 10});
    });

    test('uses default quickLoadLimit when not provided', () => {
      const result = calcInitOffsetLimit({
        size: 10,
        curIndex: 5,
        lazyLoad: true
      });
      expect(result.initLimit).toBe(DEFAULT_QUICKLOAD_LIMIT);
    });
  });
});

