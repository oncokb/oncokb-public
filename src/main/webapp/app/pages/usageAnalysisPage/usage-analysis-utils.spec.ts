import {
  UserOverviewUsageWithUsageTypes,
  isPrivateResource,
} from './usage-analysis-utils';

describe('usage-analysis-utils', () => {
  const tests: [string, boolean][] = [['/api/private/something', true]];

  test.each(tests)(
    'For "%s" isPrivateResource should return %s',
    (resource, expected) => {
      const actual = isPrivateResource(resource);
      expect(actual).toEqual(expected);
    }
  );
});

const sampleUserOverview: UserOverviewUsageWithUsageTypes = {} as any;
