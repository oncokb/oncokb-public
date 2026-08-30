import {
  STRING_OPERATORS,
  applyStringOperator,
  NUMBER_OPERATORS,
  applyNumberOperator,
} from './types';

describe('applyStringOperator', () => {
  it('keeps every value available when no keyword is typed', () => {
    Object.values(STRING_OPERATORS).forEach(operator => {
      expect(applyStringOperator('Oncogenic', '', operator)).toBe(true);
    });
  });

  it('matches case insensitively', () => {
    expect(
      applyStringOperator('Likely Oncogenic', 'ONCO', STRING_OPERATORS.contains)
    ).toBe(true);
  });

  it('applies each operator', () => {
    expect(
      applyStringOperator('Oncogenic', 'onco', STRING_OPERATORS.contains)
    ).toBe(true);
    expect(
      applyStringOperator('Oncogenic', 'onco', STRING_OPERATORS.notContains)
    ).toBe(false);
    expect(
      applyStringOperator('Oncogenic', 'onco', STRING_OPERATORS.equals)
    ).toBe(false);
    expect(
      applyStringOperator('Oncogenic', 'oncogenic', STRING_OPERATORS.equals)
    ).toBe(true);
    expect(
      applyStringOperator('Oncogenic', 'onco', STRING_OPERATORS.startsWith)
    ).toBe(true);
    expect(
      applyStringOperator('Oncogenic', 'genic', STRING_OPERATORS.endsWith)
    ).toBe(true);
  });
});

describe('applyNumberOperator', () => {
  it('keeps every value available until a bound is entered', () => {
    Object.values(NUMBER_OPERATORS).forEach(operator => {
      expect(applyNumberOperator(5, [null, null], operator)).toBe(false);
    });
  });

  it('applies each operator', () => {
    expect(applyNumberOperator(5, [5, null], NUMBER_OPERATORS.equals)).toBe(
      true
    );
    expect(
      applyNumberOperator(5, [4, null], NUMBER_OPERATORS.greaterThan)
    ).toBe(true);
    expect(applyNumberOperator(5, [6, null], NUMBER_OPERATORS.lessThan)).toBe(
      true
    );
    expect(
      applyNumberOperator(5, [5, null], NUMBER_OPERATORS.greaterEqual)
    ).toBe(true);
    expect(applyNumberOperator(5, [5, null], NUMBER_OPERATORS.lessEqual)).toBe(
      true
    );
    expect(applyNumberOperator(5, [1, 10], NUMBER_OPERATORS.between)).toBe(
      true
    );
    expect(applyNumberOperator(5, [6, 10], NUMBER_OPERATORS.between)).toBe(
      false
    );
  });
});
