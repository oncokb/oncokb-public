import { MUTATION_EFFECT, ONCOGENICITY } from 'app/config/constants';
import _ from 'lodash';
import { Alteration } from '../api/generated/OncoKbAPI';

export function sortByArrayIndexAsc(aIndex: number, bIndex: number) {
  if (aIndex === bIndex) {
    return 0;
  } else if (aIndex === -1) {
    return 1;
  } else if (bIndex === -1) {
    return -1;
  } else {
    return aIndex - bIndex;
  }
}

export function defaultSortMethod(a: any, b: any): number {
  // force null and undefined to the bottom
  a = a === null || a === undefined ? -Infinity : a;
  b = b === null || b === undefined ? -Infinity : b;

  // force any string values to lowercase
  a = typeof a === 'string' ? a.toLowerCase() : a;
  b = typeof b === 'string' ? b.toLowerCase() : b;

  // Return either 1 or -1 to indicate a sort priority
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }

  // returning 0 or undefined will use any subsequent column sorting methods or the row index as a tiebreaker
  return 0;
}

export function sortNumber(a: number, b: number): number {
  if (!_.isNumber(a)) {
    if (!_.isNumber(b)) {
      return 0;
    } else {
      return 1;
    }
  }
  if (!_.isNumber(b)) {
    return -1;
  }
  return a - b;
}

export function sortByAlteration(a: Alteration, b: Alteration): number {
  // force null and undefined to the bottom
  let result = sortNumber(a.proteinStart, b.proteinStart);

  if (result === 0) {
    result = sortNumber(a.proteinEnd, b.proteinEnd);
  }
  return result;
}

const oncogenicityOrder = [
  ONCOGENICITY.ONCOGENIC,
  ONCOGENICITY.LIKELY_ONCOGENIC,
  ONCOGENICITY.NEUTRAL,
  ONCOGENICITY.LIKELY_NEUTRAL,
  ONCOGENICITY.INCONCLUSIVE,
  ONCOGENICITY.UNKNOWN,
];
const mutationEffectOrder = [
  MUTATION_EFFECT.GAIN_OF_FUNCTION,
  MUTATION_EFFECT.LIKELY_GAIN_OF_FUNCTION,
  MUTATION_EFFECT.LOSS_OF_FUNCTION,
  MUTATION_EFFECT.LIKELY_LOSS_OF_FUNCTION,
  MUTATION_EFFECT.NEUTRAL,
  MUTATION_EFFECT.LIKELY_NEUTRAL,
  MUTATION_EFFECT.SWITCH_OF_FUNCTION,
  MUTATION_EFFECT.LIKELY_SWITCH_OF_FUNCTION,
  MUTATION_EFFECT.INCONCLUSIVE,
  MUTATION_EFFECT.UNKNOWN,
];

export function oncogenicitySortMethod(a: ONCOGENICITY, b: ONCOGENICITY) {
  return sortByArrayIndexAsc(
    oncogenicityOrder.indexOf(a),
    oncogenicityOrder.indexOf(b)
  );
}

export function mutationEffectSortMethod(
  a: MUTATION_EFFECT,
  b: MUTATION_EFFECT
) {
  return sortByArrayIndexAsc(
    mutationEffectOrder.indexOf(a),
    mutationEffectOrder.indexOf(b)
  );
}
