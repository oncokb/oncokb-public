import {
  debounce,
  find,
  findLast,
  flatMap,
  flatten,
  groupBy,
  has,
  intersection,
  isNumber,
  keyBy,
  partition,
  sortBy,
  sortByKey,
  uniq,
  uniqBy,
  upperFirst,
  xor,
} from 'app/shared/utils/LodashUtils';

describe('lodash utils test', () => {
  describe('debounce function', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce a function and only call it after the specified wait time', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      debouncedFunc();
      expect(func).not.toBeCalled();

      jest.advanceTimersByTime(1000);
      expect(func).toBeCalled();
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should only call the function once if called multiple times within the wait time', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      expect(func).not.toBeCalled();

      jest.advanceTimersByTime(1000);
      expect(func).toBeCalled();
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should call the function with the latest arguments', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      debouncedFunc(1);
      debouncedFunc(2);
      debouncedFunc(3);

      jest.advanceTimersByTime(1000);
      expect(func).toHaveBeenCalledWith(3);
    });

    it('should use the correct context when calling the function', () => {
      const func = jest.fn();
      const context = { value: 42 };
      const debouncedFunc = debounce(function () {
        func(this.value);
      }, 1000);

      debouncedFunc.call(context);

      jest.advanceTimersByTime(1000);
      expect(func).toHaveBeenCalledWith(42);
    });

    it('should clear the previous timeout if called again within the wait time', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      debouncedFunc();
      jest.advanceTimersByTime(500);
      debouncedFunc();
      jest.advanceTimersByTime(500);

      expect(func).not.toBeCalled();

      jest.advanceTimersByTime(500);
      expect(func).toBeCalled();
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('flatten function', () => {
    it('should flatten a simple two-dimensional array', () => {
      const array = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      expect(flatten(array)).toEqual(expected);
    });

    it('should return an empty array when input is an empty array', () => {
      const array: any[] = [];
      const expected: any[] = [];
      expect(flatten(array)).toEqual(expected);
    });

    it('should flatten an array with empty subarrays', () => {
      const array: any[][] = [[], [], []];
      const expected: any[] = [];
      expect(flatten(array)).toEqual(expected);
    });

    it('should flatten a nested array with mixed empty and non-empty subarrays', () => {
      const array = [[1, 2], [], [3, 4, 5], [], [6]];
      const expected = [1, 2, 3, 4, 5, 6];
      expect(flatten(array)).toEqual(expected);
    });
  });

  describe('flatMap function', () => {
    it('should apply a function that returns an array and flatten the result', () => {
      const array = [1, 2, 3];
      const fn = (num: number) => [num, num * 2];
      const expected = [1, 2, 2, 4, 3, 6];
      expect(flatMap(array, fn)).toEqual(expected);
    });

    it('should apply a function that returns a single element and flatten the result', () => {
      const array = [1, 2, 3];
      const fn = (num: number) => num * 2;
      const expected = [2, 4, 6];
      expect(flatMap(array, fn)).toEqual(expected);
    });

    it('should return an empty array when input is an empty array', () => {
      const array: number[] = [];
      const fn = (num: number) => [num, num * 2];
      const expected: number[] = [];
      expect(flatMap(array, fn)).toEqual(expected);
    });

    it('should apply a function that returns mixed types and flatten the result', () => {
      const array = [1, 2, 3];
      const fn = (num: number) => [num, `${num}`];
      const expected = [1, '1', 2, '2', 3, '3'];
      expect(flatMap(array, fn)).toEqual(expected);
    });

    it('should handle a function that returns empty arrays and flatten the result', () => {
      const array = [1, 2, 3];
      const fn = (num: number) => [];
      const expected: number[] = [];
      expect(flatMap(array, fn)).toEqual(expected);
    });
  });

  describe('find function', () => {
    it('should find an element in an array of numbers', () => {
      const numbers = [1, 2, 3, 4, 5];
      const isEven = (num: number) => num % 2 === 0;
      expect(find(numbers, isEven)).toBe(2);
    });

    it('should find an element in an array of strings', () => {
      const strings = ['apple', 'banana', 'cherry'];
      const startsWithB = (str: string) => str.startsWith('b');
      expect(find(strings, startsWithB)).toBe('banana');
    });

    it('should find an element in an array of objects', () => {
      type objectT = { id: number };
      const objects: objectT[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const hasId2 = (obj: objectT) => obj.id === 2;
      expect(find(objects, hasId2)).toBe(objects[1]);
    });

    it('should return undefined if element is not found in the array', () => {
      const numbers = [1, 3, 5];
      const isEven = (num: number) => num % 2 === 0;
      expect(find(numbers, isEven)).toBeUndefined();
    });

    it('should return undefined for an empty array', () => {
      const emptyArray: any[] = [];
      const alwaysTrue = () => true;
      expect(find(emptyArray, alwaysTrue)).toBeUndefined();
    });

    it('should find the first element that matches the predicate', () => {
      const numbers = [1, 2, 3, 4, 5];
      const greaterThanThree = (num: number) => num > 3;
      expect(find(numbers, greaterThanThree)).toBe(4);
    });

    it('should find an element in an array of mixed types', () => {
      type datumType = number | string | object;
      const mixedArray: datumType[] = [1, 'two', { id: 3 }, 4];
      const isObject = (element: datumType) =>
        typeof element === 'object' && element !== null;
      expect(find(mixedArray, isObject)).toEqual({ id: 3 });
    });
  });

  describe('findLast function', () => {
    it('should find the last element that matches the predicate in an array of numbers', () => {
      const array = [1, 2, 3, 4, 5];
      const isEven = (num: number) => num % 2 === 0;
      expect(findLast(array, isEven)).toBe(4);
    });

    it('should find the last element that matches the predicate in an array of strings', () => {
      const array = ['apple', 'banana', 'cherry', 'blueberry'];
      const startsWithB = (str: string) => str.startsWith('b');
      expect(findLast(array, startsWithB)).toBe('blueberry');
    });

    it('should find the last element that matches the predicate in an array of objects', () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
      const hasId2 = (obj: { id: number }) => obj.id % 2 === 0;
      expect(findLast(array, hasId2)).toEqual({ id: 4 });
    });

    it('should return undefined if no elements match the predicate', () => {
      const array = [1, 3, 5];
      const isEven = (num: number) => num % 2 === 0;
      expect(findLast(array, isEven)).toBeUndefined();
    });

    it('should return undefined for an empty array', () => {
      const array: number[] = [];
      const alwaysTrue = () => true;
      expect(findLast(array, alwaysTrue)).toBeUndefined();
    });

    it('should not modify the original array', () => {
      const array = [1, 2, 3, 4, 5];
      const isEven = (num: number) => num % 2 === 0;
      const originalArray = [...array]; // Create a copy of the original array
      findLast(array, isEven);
      expect(array).toEqual(originalArray); // Ensure the original array remains unchanged
    });
  });

  describe('groupBy function', () => {
    it('should group objects by a specified key', () => {
      const array = [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: 'vegetable', name: 'carrot' },
      ];
      const expected = {
        fruit: [
          { category: 'fruit', name: 'apple' },
          { category: 'fruit', name: 'banana' },
        ],
        vegetable: [{ category: 'vegetable', name: 'carrot' }],
      };
      expect(groupBy(array, 'category')).toEqual(expected);
    });

    it('should return an empty object for an empty array', () => {
      const array: any[] = [];
      const expected = {};
      expect(groupBy(array, 'category')).toEqual(expected);
    });

    it('should handle objects with undefined keys gracefully', () => {
      const array = [
        { category: undefined, name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: undefined, name: 'carrot' },
      ];
      const expected = {
        undefined: [
          { category: undefined, name: 'apple' },
          { category: undefined, name: 'carrot' },
        ],
        fruit: [{ category: 'fruit', name: 'banana' }],
      };
      expect(groupBy(array, 'category')).toEqual(expected);
    });

    it('should group all objects under the same key if they have the same key value', () => {
      const array = [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: 'fruit', name: 'carrot' },
      ];
      const expected = {
        fruit: [
          { category: 'fruit', name: 'apple' },
          { category: 'fruit', name: 'banana' },
          { category: 'fruit', name: 'carrot' },
        ],
      };
      expect(groupBy(array, 'category')).toEqual(expected);
    });

    it('should handle arrays with different types of values for the key', () => {
      const array = [
        { category: 1, name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: true, name: 'carrot' },
      ];
      const expected = {
        1: [{ category: 1, name: 'apple' }],
        fruit: [{ category: 'fruit', name: 'banana' }],
        true: [{ category: true, name: 'carrot' }],
      };
      expect(groupBy(array, 'category')).toEqual(expected);
    });
  });

  describe('has function', () => {
    it('should return true if the key exists', () => {
      const obj = { a: { b: { c: 1 } } };
      expect(has(obj, 'a.b.c')).toBe(true);
    });

    it('should return false if the key does not exist', () => {
      const obj = { a: { b: { c: 1 } } };
      expect(has(obj, 'a.b.d')).toBe(false);
    });

    it('should handle empty object', () => {
      const obj = {};
      expect(has(obj, 'a')).toBe(false);
    });

    it('should return false for non-object types', () => {
      const obj = { a: 1 };
      expect(has(obj, 'a.b')).toBe(false);
    });
  });

  describe('intersection function', () => {
    it('should return an array of shared values', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [2, 3, 4];
      expect(intersection(arr1, arr2)).toEqual([2, 3]);
    });

    it('should return an empty array if no shared values', () => {
      const arr1 = [1, 2];
      const arr2 = [3, 4];
      expect(intersection(arr1, arr2)).toEqual([]);
    });

    it('should handle multiple arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [2, 3, 4];
      const arr3 = [3, 4, 5];
      expect(intersection(arr1, arr2, arr3)).toEqual([3]);
    });

    it('should handle empty arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2: number[] = [];
      expect(intersection(arr1, arr2)).toEqual([]);
    });

    it('should reserve the order based on first occurance', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [3, 2, 4];
      expect(intersection(arr1, arr2)).toEqual([2, 3]);
    });
  });

  describe('isNumber function', () => {
    it('should return true for number literals', () => {
      expect(isNumber(123)).toBe(true);
    });

    it('should return true for Number objects', () => {
      expect(isNumber(new Number(123))).toBe(true); // eslint-disable-line no-new-wrappers
    });

    it('should return false for non-number types', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber(true)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });
  });

  describe('keyBy function', () => {
    it('should create an object composed of keys generated from the key', () => {
      const array = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 },
      ];
      const expected = {
        a: { id: 'a', value: 1 },
        b: { id: 'b', value: 2 },
        c: { id: 'c', value: 3 },
      };
      expect(keyBy(array, 'id')).toEqual(expected);
    });

    it('should return an empty object for an empty array', () => {
      const array: { id: string }[] = [];
      const expected = {};
      expect(keyBy(array, 'id')).toEqual(expected);
    });

    it('should handle duplicate keys by using the last value', () => {
      const array = [
        { id: 'a', value: 1 },
        { id: 'a', value: 2 },
      ];
      const expected = {
        a: { id: 'a', value: 2 },
      };
      expect(keyBy(array, 'id')).toEqual(expected);
    });
  });

  describe('partition function', () => {
    it('should partition the array into two groups based on the predicate', () => {
      const array = [1, 2, 3, 4, 5];
      const predicate = (num: number) => num % 2 === 0;
      const expected = [
        [2, 4],
        [1, 3, 5],
      ];
      expect(partition(array, predicate)).toEqual(expected);
    });

    it('should return two empty arrays if input array is empty', () => {
      const array: number[] = [];
      const predicate = (num: number) => num % 2 === 0;
      const expected = [[], []];
      expect(partition(array, predicate)).toEqual(expected);
    });

    it('should place all elements in the second array if none match the predicate', () => {
      const array = [1, 3, 5];
      const predicate = (num: number) => num % 2 === 0;
      const expected = [[], [1, 3, 5]];
      expect(partition(array, predicate)).toEqual(expected);
    });

    it('should place all elements in the first array if all match the predicate', () => {
      const array = [2, 4, 6];
      const predicate = (num: number) => num % 2 === 0;
      const expected = [[2, 4, 6], []];
      expect(partition(array, predicate)).toEqual(expected);
    });
  });

  describe('sortByKey function', () => {
    it('should sort an array of objects by the specified key when value is number', () => {
      const array = [
        { id: 'c', value: 3 },
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
      ];
      const expected = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 },
      ];
      expect(sortByKey(array, 'value')).toEqual(expected);
    });

    it('should sort an array of objects by the specified key when value is string', () => {
      const array = [
        { id: 'c', value: 3 },
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
      ];
      const expected = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 },
      ];
      expect(sortByKey(array, 'id')).toEqual(expected);
    });

    it('should handle an empty array', () => {
      const array: { id: string }[] = [];
      const expected: { id: string }[] = [];
      expect(sortByKey(array, 'id')).toEqual(expected);
    });

    it('should handle an array with a single element', () => {
      const array = [{ id: 'a', value: 1 }];
      const expected = [{ id: 'a', value: 1 }];
      expect(sortByKey(array, 'id')).toEqual(expected);
    });

    it('should handle an array with duplicate keys', () => {
      const array = [
        { id: 'a', value: 1 },
        { id: 'a', value: 2 },
        { id: 'b', value: 3 },
      ];
      const expected = [
        { id: 'a', value: 1 },
        { id: 'a', value: 2 },
        { id: 'b', value: 3 },
      ];
      expect(sortByKey(array, 'id')).toEqual(expected);
    });
  });

  describe('sortBy function', () => {
    it('should sort an array of objects by the result of the comparator function when the value is string', () => {
      const array = [
        { id: 'c', value: 3 },
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
      ];
      const expected = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 },
      ];
      expect(sortBy(array, item => item.id)).toEqual(expected);
    });

    it('should sort an array of objects by the result of the comparator function when the value is number', () => {
      const array = [
        { id: 'c', value: 3 },
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
      ];
      const expected = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 },
      ];
      expect(sortBy(array, item => item.value)).toEqual(expected);
    });

    it('should handle an empty array', () => {
      const array: { id: string }[] = [];
      const expected: { id: string }[] = [];
      expect(sortBy(array, item => item.id)).toEqual(expected);
    });

    it('should handle an array with a single element', () => {
      const array = [{ id: 'a', value: 1 }];
      const expected = [{ id: 'a', value: 1 }];
      expect(sortBy(array, item => item.id)).toEqual(expected);
    });
  });

  describe('upperFirst function', () => {
    it('should convert the first character of string to upper case and the remaining to lower case', () => {
      expect(upperFirst('hello')).toBe('Hello');
      expect(upperFirst('WORLD')).toBe('World');
    });

    it('should return an empty string if input is empty', () => {
      expect(upperFirst('')).toBe('');
    });

    it('should handle a single character string', () => {
      expect(upperFirst('a')).toBe('A');
    });
  });

  describe('uniq function', () => {
    it('should create a duplicate-free version of an array', () => {
      const array = [1, 2, 2, 3, 4, 4, 5];
      const expected = [1, 2, 3, 4, 5];
      expect(uniq(array)).toEqual(expected);
    });

    it('should handle an empty array', () => {
      const array: number[] = [];
      const expected: number[] = [];
      expect(uniq(array)).toEqual(expected);
    });

    it('should handle an array with a single element', () => {
      const array = [1];
      const expected = [1];
      expect(uniq(array)).toEqual(expected);
    });

    it('should reserve the order based on the first occurrence', () => {
      const array = [1, 2, 3, 2, 5, 4, 5];
      const expected = [1, 2, 3, 5, 4];
      expect(uniq(array)).toEqual(expected);
    });
  });

  describe('uniqBy function', () => {
    it('should create an unique version of an array based on a function', () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }];
      const expected = [{ id: 1 }, { id: 2 }, { id: 3 }];
      expect(uniqBy(array, item => item.id)).toEqual(expected);
    });

    it('should create an unique version of an array based on a key', () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }];
      const expected = [{ id: 1 }, { id: 2 }, { id: 3 }];
      expect(uniqBy(array, 'id')).toEqual(expected);
    });

    it('should handle an empty array', () => {
      const array: { id: string }[] = [];
      const expected: { id: string }[] = [];
      expect(uniqBy(array, 'id')).toEqual(expected);
    });

    it('should handle an array with a single element', () => {
      const array = [{ id: 1 }];
      const expected = [{ id: 1 }];
      expect(uniqBy(array, 'id')).toEqual(expected);
    });
  });

  describe('xor function', () => {
    it('should create an array of values not included in the other given arrays', () => {
      const array1 = [1, 2, 3];
      const array2 = [2, 3, 4];
      const expected = [1, 4];
      expect(xor(array1, array2)).toEqual(expected);
    });

    it('should handle multiple arrays', () => {
      const array1 = [1, 2, 3];
      const array2 = [2, 3, 4];
      const array3 = [3, 4, 5];
      const expected = [1, 5];
      expect(xor(array1, array2, array3)).toEqual(expected);
    });

    it('should handle empty arrays', () => {
      const array1 = [1, 2, 3];
      const array2: number[] = [];
      const expected = [1, 2, 3];
      expect(xor(array1, array2)).toEqual(expected);
    });

    it('should reserve the order based on the first occurrence', () => {
      const array1 = [1, 2, 3];
      const array2 = [2, 4, 3];
      const expected = [1, 4];
      expect(xor(array1, array2)).toEqual(expected);
    });
  });
});
