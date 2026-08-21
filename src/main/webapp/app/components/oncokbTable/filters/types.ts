export enum FilterTypes {
  STRING = 'string',
  NUMBER = 'number',
}

export interface IOperator {
  id: string;
  label: string;
}

export interface StringOperator extends IOperator {
  id: 'contains' | 'notContains' | 'equals' | 'startsWith' | 'endsWith';
}

export interface NumberOperator extends IOperator {
  id:
    | 'equals'
    | 'greaterThan'
    | 'lessThan'
    | 'greaterEqual'
    | 'lessEqual'
    | 'between';
}

export const STRING_OPERATORS: {
  [key in StringOperator['id']]: StringOperator;
} = {
  contains: { id: 'contains', label: 'Contains' },
  notContains: { id: 'notContains', label: 'Does not contain' },
  equals: { id: 'equals', label: 'Equals' },
  startsWith: { id: 'startsWith', label: 'Starts with' },
  endsWith: { id: 'endsWith', label: 'Ends with' },
};

export const applyStringOperator = (
  itemString: string,
  filterString: string,
  stringOperator: StringOperator
) => {
  const stringValue = itemString.toLowerCase();
  const filterValue = filterString.toLowerCase();

  // An empty keyword is the initial state of the menu rather than a keyword to
  // match, so every value stays available no matter which operator is picked.
  if (filterValue === '') {
    return true;
  }

  switch (stringOperator.id) {
    case 'contains':
      return stringValue.includes(filterValue);
    case 'notContains':
      return !stringValue.includes(filterValue);
    case 'equals':
      return stringValue === filterValue;
    case 'startsWith':
      return stringValue.startsWith(filterValue);
    case 'endsWith':
      return stringValue.endsWith(filterValue);
    default:
      return true;
  }
};

export const NUMBER_OPERATORS: {
  [key in NumberOperator['id']]: NumberOperator;
} = {
  between: { id: 'between', label: 'Between' },
  equals: { id: 'equals', label: 'Equals' },
  greaterThan: { id: 'greaterThan', label: 'Greater than' },
  lessThan: { id: 'lessThan', label: 'Less than' },
  greaterEqual: { id: 'greaterEqual', label: 'Greater than or equal' },
  lessEqual: { id: 'lessEqual', label: 'Less than or equal' },
};

export const applyNumberOperator = (
  num: number,
  range: [number | null, number | null],
  numberOperator: NumberOperator
) => {
  const [start, end] = range;

  switch (numberOperator.id) {
    case 'equals':
      return start !== null && num === start;
    case 'greaterThan':
      return start !== null && num > start;
    case 'lessThan':
      return start !== null && num < start;
    case 'greaterEqual':
      return start !== null && num >= start;
    case 'lessEqual':
      return start !== null && num <= start;
    case 'between':
      return start !== null && end !== null && num >= start && num <= end;
    default:
      return true;
  }
};
