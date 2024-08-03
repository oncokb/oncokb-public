type DebouncedFunction<F extends (...args: any[]) => any> = (
  ...args: Parameters<F>
) => void;
type NonArrayObject = { [key: string]: any } & { length?: never }; // This excludes arrays

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed since the last time the debounced function was invoked.
 * @param func - The function to debounce.
 * @param wait - The number of milliseconds to delay.
 * @returns The new debounced function.
 */
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): DebouncedFunction<F> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<F>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * Flattens a two-dimensional array into a one-dimensional array.
 * @param array - The array to flatten.
 * @returns The new flattened array.
 */
export function flatten<T>(array: T[][]) {
  return array.reduce((a, b) => a.concat(b), []);
}

/**
 * Creates a flattened array of values by running each element in `array` through `fn` and flattening the mapped results.
 * @param array - The array to process.
 * @param fn - The function to apply to each element.
 * @returns The new flattened array.
 */
export function flatMap<T>(array: T[], fn: (datum: T) => any) {
  return array.reduce((acc, item) => {
    const result = fn(item);
    return acc.concat(result);
  }, []);
}

/**
 * Iterates over elements of `array`, returning the first element `predicate` returns truthy for.
 * @param array - The array to inspect.
 * @param predicate - The function invoked per iteration.
 * @returns The matched element, else `undefined`.
 */
export function find<T>(array: T[], predicate: (datum: T) => boolean) {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
  return undefined;
}

/**
 * This method is like `find` except that it iterates over elements of `array` from right to left.
 * @param array - The array to inspect.
 * @param predicate - The function invoked per iteration.
 * @returns The matched element, else `undefined`.
 */
export function findLast<T>(array: T[], predicate: (datum: T) => boolean) {
  return find([...array].reverse(), predicate);
}

/**
 * Creates an object composed of keys generated from the results of running each element of `array` through `key`.
 * @param array - The array to iterate over.
 * @param key - The key to group by.
 * @returns The composed aggregate object.
 */
export function groupBy<T extends object & NonArrayObject, K extends keyof T>(
  array: T[],
  key: K
) {
  return array.reduce((acc, datum) => {
    if (!acc[datum[key]]) {
      acc[datum[key]] = [];
    }
    acc[datum[key]].push(datum);
    return acc;
  }, {} as { [key in K]: T[] });
}

/**
 * Checks if `key` is a direct property of `object`.
 * @param obj - The object to query.
 * @param key - The path to check. The path can be nested prop. For instance: a.b.c
 * @returns `true` if `key` exists, else `false`.
 */
export function has<T extends object & NonArrayObject>(obj: T, key: string) {
  const keyParts = key.split('.');
  let clone = JSON.parse(JSON.stringify(obj));
  let i = 0;
  while (i < keyParts.length) {
    if (keyParts[i] && clone[keyParts[i]]) {
      clone = clone[keyParts[i]];
      i++;
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Creates an array of unique values that are included in all given arrays.
 * @param arrays - The arrays to inspect.
 * @returns The new array of shared values.
 */
export function intersection(...arrays: (number | string)[][]) {
  return arrays.reduce((a, b) => a.filter(c => b.includes(c)));
}

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 * @param value - The value to check.
 * @returns `true` if `value` is a number, else `false`.
 */
export function isNumber(value: any) {
  return typeof value === 'number' || value instanceof Number;
}

/**
 * Creates an object composed of keys generated from the results of running each element of `array` through `key`.
 * @param array - The array to iterate over.
 * @param key - The key to group by.
 * @returns The composed aggregate object.
 */
export function keyBy<T extends object & NonArrayObject, K extends keyof T>(
  array: T[],
  key: K
) {
  return array.reduce((acc, datum) => {
    acc[datum[key]] = datum;
    return acc;
  }, {} as { [key in K]: T });
}

/**
 * Creates an array of elements split into two groups, the first of which contains elements `predicate` returns truthy for, the second of which contains elements `predicate` returns falsy for.
 * @param array - The array to iterate over.
 * @param predicate - The function invoked per iteration.
 * @returns The array of grouped elements.
 */
export function partition<T>(array: T[], predicate: (datum: T) => boolean) {
  return array.reduce(
    ([pass, fail], elem) =>
      predicate(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]],
    [[], []]
  );
}

/**
 * Sorts an array of objects by the specified key.
 * @param array - The array to sort.
 * @param key - The key to sort by.
 * @returns The sorted array.
 */
export function sortByKey<T extends object & NonArrayObject, K extends keyof T>(
  array: T[],
  key: K
) {
  return array.sort((a: T, b: T) =>
    a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0
  );
}

/**
 * Sorts an array of objects by the result of the comparator function.
 * @param array - The array to sort.
 * @param comp - The function to determine the sort order.
 * @returns The sorted array.
 */
export function sortBy<T extends object & NonArrayObject, K extends keyof T>(
  array: T[],
  comp: (datum: T) => number | string
) {
  return array.sort((a: T, b: T) => {
    const ra = comp(a);
    const rb = comp(b);
    if (typeof ra === 'string' || typeof rb === 'string') {
      return `${ra}`.localeCompare(`${rb}`);
    } else {
      return ra - rb;
    }
  });
}

/**
 * Converts the first character of `string` to upper case and the remaining to lower case.
 * @param string - The string to convert.
 * @returns The converted string.
 */
export function upperFirst(string: string) {
  return string
    ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
    : '';
}

/**
 * Creates a duplicate-free version of an array.
 * @param array - The array to inspect.
 * @returns The new duplicate-free array.
 */
export function uniq<T>(array: T[]) {
  return [...new Set(array)];
}

/**
 * This method is like `uniq` except that it accepts `iteratee` which is invoked for each element in `array` to generate the criterion by which uniqueness is computed.
 * @param array - The array to inspect.
 * @param iteratee - The iteratee invoked per element.
 * @returns The new duplicate-free array.
 */
export function uniqBy<T extends object & NonArrayObject>(
  array: T[],
  iteratee: ((item: T) => any) | keyof T
) {
  const seen = new Set();
  const result = [];

  for (const item of array) {
    const computed =
      typeof iteratee === 'function' ? iteratee(item) : item[iteratee];
    if (!seen.has(computed)) {
      seen.add(computed);
      result.push(item);
    }
  }

  return result;
}

/**
 * Creates an array of `array` values not included in the other given arrays. The order of result values is determined by the order they occur in the arrays.
 * @param arrays - The arrays to inspect.
 * @returns The new array of filtered values.
 */
export function xor<K extends number | string>(...arrays: K[][]) {
  // Manually flatten the arrays into a single array
  const flattened = flatten(arrays);

  // Create a frequency map to count occurrences of each element
  const frequencyMap = flattened.reduce((acc, val: K) => {
    acc[`${val}`] = (acc[`${val}`] || 0) + 1;
    return acc;
  }, {} as { string: number });

  // Filter out elements that appear only once and preserve the order
  const result = [];
  const seen = new Set();

  for (const val of flattened) {
    const strVal = `${val}`;
    if (frequencyMap[strVal] === 1 && !seen.has(strVal)) {
      result.push(val);
      seen.add(val);
    }
  }

  return result;
}
