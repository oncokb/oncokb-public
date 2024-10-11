import {
  UserOverviewUsageWithUsageTypes,
  isPrivateResource,
  mapUserOrResourceUsageToUsageRecords,
  mapUsageSummaryToTimeGroupedUsageRecords,
  ToggleValue,
  UsageSummaryWithUsageTypes,
} from './usage-analysis-utils';

const userOverviewUsageWithUsageTypes: UserOverviewUsageWithUsageTypes[] = [
  {
    userId: '0',
    userEmail: '0doej@FakeCo.com',
    dayUsage: {
      '2020-01-01': {
        totalUsage: 48.0,
        totalPublicUsage: 48.0,
        mostUsedEndpoint: '/api/v1/annotate/structuralVariants',
        mostUsedPublicEndpoint: '/api/v1/annotate/structuralVariants',
        maxUsageProportion: 100.0,
        publicMaxUsageProportion: 100.0,
      },
    },
    monthUsage: {
      '2020-01': {
        totalUsage: 376.0,
        totalPublicUsage: 186.0,
        mostUsedEndpoint: '/api/v1/annotate/structuralVariants',
        mostUsedPublicEndpoint: '/api/v1/annotate/structuralVariants',
        maxUsageProportion: 49.4,
        publicMaxUsageProportion: 100.0,
      },
    },
    yearUsage: {
      '2020': {
        totalUsage: 4436.0,
        totalPublicUsage: 2299.0,
        mostUsedEndpoint: '/api/private/search/typeahead',
        mostUsedPublicEndpoint: '/api/v1/annotate/structuralVariants',
        maxUsageProportion: 25.3,
        publicMaxUsageProportion: 40.0,
      },
    },
  },
];

const usageSummaryWithUsageTypesResource: UsageSummaryWithUsageTypes = {
  year: {
    '2020': {
      '/api/v1/annotate/structuralVariants': 1924,
      '/api/private/search/typeahead': 1868,
      '/api/private/utils/numbers/levels/': 1713,
      '/api/v1/annotate/mutations/byProteinChange': 1731,
      '/api/private/utils/numbers/main/': 1081,
      '/api/v1/annotate/copyNumberAlterations': 1035,
    },
  },
  month: {
    '2020-01': {
      '/api/v1/annotate/structuralVariants': 265,
      '/api/private/search/typeahead': 230,
      '/api/private/utils/numbers/levels/': 21,
      '/api/v1/annotate/mutations/byProteinChange': 115,
    },
  },
  day: {
    '2020-01-01': { '/api/v1/annotate/structuralVariants': 127 },
    '2020-01-07': { '/api/v1/annotate/structuralVariants': 74 },
  },
};

const usageSummaryWithUsageTypesEmail: UsageSummaryWithUsageTypes = {
  year: {
    '2020': { '0doej@FakeCo.com': 712, '1smithj@DemoLLC.com': 1019 },
  },
  month: {
    '2020-02': { '0doej@FakeCo.com': 30, '1smithj@DemoLLC.com': 75 },
  },
  day: {
    '2020-02-04': { '0doej@FakeCo.com': 30 },
    '2020-03-01': { '0doej@FakeCo.com': 26 },
  },
};

describe('usage-analysis-utils', () => {
  const isPrivateResourceTests: [string, boolean][] = [
    ['/api/private/something', true],
    ['/api/something', false],
    ['/api/something/private', false],
  ];

  test.each(isPrivateResourceTests)(
    'For "%s" isPrivateResource should return %s',
    (resource, expected) => {
      const actual = isPrivateResource(resource);
      expect(actual).toEqual(expected);
    }
  );

  const mapUserOrResourceUsageToUsageRecordsTests: [
    Parameters<typeof mapUserOrResourceUsageToUsageRecords>,
    ReturnType<typeof mapUserOrResourceUsageToUsageRecords>
  ][] = [
    [
      [
        userOverviewUsageWithUsageTypes,
        ToggleValue.RESULTS_BY_YEAR,
        true,
        '2020-01-01',
        '2020-12-31',
        true,
      ],
      [
        {
          maxUsageProportion: 25.3,
          resource: '/api/private/search/typeahead',
          time: '2020',
          usage: 4436,
          userEmail: '0doej@FakeCo.com',
          userId: '0',
        },
      ],
    ],
  ];

  test.each(mapUserOrResourceUsageToUsageRecordsTests)(
    'For "%s" mapUserOrResourceUsageToUsageRecords should return %s',
    (
      [
        incomingData,
        timeTypeToggleValue,
        filterToggled,
        fromDate,
        toDate,
        isAllUsage,
      ],
      expected
    ) => {
      const actual = mapUserOrResourceUsageToUsageRecords(
        incomingData,
        timeTypeToggleValue,
        filterToggled,
        fromDate,
        toDate,
        isAllUsage
      );
      expect(actual).toEqual(expected);
    }
  );

  const mapUsageSummaryToTimeGroupedUsageRecordsTests: [
    Parameters<typeof mapUsageSummaryToTimeGroupedUsageRecords>,
    ReturnType<typeof mapUsageSummaryToTimeGroupedUsageRecords>
  ][] = [
    [
      [usageSummaryWithUsageTypesEmail, 'email'],
      {
        'Day Detail': [
          {
            maxUsageProportion: 0,
            resource: '',
            time: '2020-02-04',
            usage: 30,
            userEmail: '0doej@FakeCo.com',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '',
            time: '2020-03-01',
            usage: 26,
            userEmail: '0doej@FakeCo.com',
            userId: undefined,
          },
        ],
        'Month Detail': [
          {
            maxUsageProportion: 0,
            resource: '',
            time: '2020-02',
            usage: 30,
            userEmail: '0doej@FakeCo.com',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '',
            time: '2020-02',
            usage: 75,
            userEmail: '1smithj@DemoLLC.com',
            userId: undefined,
          },
        ],
        'Year Detail': [
          {
            maxUsageProportion: 0,
            resource: '',
            time: '2020',
            usage: 712,
            userEmail: '0doej@FakeCo.com',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '',
            time: '2020',
            usage: 1019,
            userEmail: '1smithj@DemoLLC.com',
            userId: undefined,
          },
        ],
      },
    ],
    [
      [usageSummaryWithUsageTypesResource, 'resource'],
      {
        'Day Detail': [
          {
            maxUsageProportion: 0,
            resource: '/api/v1/annotate/structuralVariants',
            time: '2020-01-01',
            usage: 127,
            userEmail: '',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '/api/v1/annotate/structuralVariants',
            time: '2020-01-07',
            usage: 74,
            userEmail: '',
            userId: undefined,
          },
        ],
        'Month Detail': [
          {
            maxUsageProportion: 0,
            resource: '/api/v1/annotate/structuralVariants',
            time: '2020-01',
            usage: 265,
            userEmail: '',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '/api/private/search/typeahead',
            time: '2020-01',
            usage: 230,
            userEmail: '',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '/api/private/utils/numbers/levels/',
            time: '2020-01',
            usage: 21,
            userEmail: '',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '/api/v1/annotate/mutations/byProteinChange',
            time: '2020-01',
            usage: 115,
            userEmail: '',
            userId: undefined,
          },
        ],
        'Year Detail': [
          {
            maxUsageProportion: 0,
            resource: '/api/v1/annotate/structuralVariants',
            time: '2020',
            usage: 1924,
            userEmail: '',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '/api/private/search/typeahead',
            time: '2020',
            usage: 1868,
            userEmail: '',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '/api/private/utils/numbers/levels/',
            time: '2020',
            usage: 1713,
            userEmail: '',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '/api/v1/annotate/mutations/byProteinChange',
            time: '2020',
            usage: 1731,
            userEmail: '',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '/api/private/utils/numbers/main/',
            time: '2020',
            usage: 1081,
            userEmail: '',
            userId: undefined,
          },
          {
            maxUsageProportion: 0,
            resource: '/api/v1/annotate/copyNumberAlterations',
            time: '2020',
            usage: 1035,
            userEmail: '',
            userId: undefined,
          },
        ],
      },
    ],
  ];

  test.each(mapUsageSummaryToTimeGroupedUsageRecordsTests)(
    'For "%s" mapUsageSummaryToTimeGroupedUsageRecords should return %s',
    ([usageSummary, keyType], expected) => {
      const actual = mapUsageSummaryToTimeGroupedUsageRecords(
        usageSummary,
        keyType
      );
      expect(actual).toEqual(expected);
    }
  );
});
