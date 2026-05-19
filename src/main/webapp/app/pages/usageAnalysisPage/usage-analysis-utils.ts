import {
  ResourceUsageAnalysisRow,
  UsageAnalysisRow,
} from 'app/shared/api/generated/API';
import {
  TABLE_MONTH_FORMAT,
  TABLE_DAY_FORMAT,
  TABLE_YEAR_FORMAT,
  USAGE_YEAR_DETAIL_TIME_KEY,
  USAGE_MONTH_DETAIL_TIME_KEY,
  USAGE_DAY_DETAIL_TIME_KEY,
} from 'app/config/constants';
import moment from 'moment';
import { SortingRule } from 'react-table';

export enum ResourceToggleValue {
  ALL_RESOURCES = 'All Resources',
  PUBLIC_RESOURCES = 'Only Public Resources',
  CUMULATIVE_USAGE = 'Cumulative Usage',
}

export enum TimeToggleValue {
  RESULTS_BY_YEAR = 'By Year',
  RESULTS_BY_WEEK = 'By Week',
  RESULTS_BY_MONTH = 'By Month',
  RESULTS_BY_DAY = 'By Day',
}

export type UserStats = {
  mostUsedEndpoint: string;
  mostUsedPublicEndpoint: string;
  maxUsageProportion: number;
  publicMaxUsageProportion: number;
  totalUsage: number;
  totalPublicUsage: number;
};

export type UserOverviewUsage = {
  userId: string;
  userEmail: string;
  dayUsage: Record<string, UserStats>;
  monthUsage: Record<string, UserStats>;
  yearUsage: Record<string, UserStats>;
};

export type UsageSummary = {
  year: Record<string, Record<string, number>>;
  month: Record<string, Record<string, number>>;
  day: Record<string, Record<string, number>>;
};

export type UserUsage = {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  licenseType: string;
  jobTitle: string;
  company: string;
  summary: UsageSummary;
};

type UsageInterval = 'DAY' | 'MONTH' | 'YEAR';

type RowsByInterval<T> = Record<UsageInterval, T[]>;

export type TimeGroupedUsageRecords = {
  [USAGE_YEAR_DETAIL_TIME_KEY]: UsageRecord[];
  [USAGE_MONTH_DETAIL_TIME_KEY]: UsageRecord[];
  [USAGE_DAY_DETAIL_TIME_KEY]: UsageRecord[];
};

export type UsageRecord = {
  resourceId?: number;
  resource: string;
  userEmail: string;
  maxUsageProportion: number;
  usage: number;
  time: string;
  userId?: string;
};

export type UsageMode = 'userSummary' | 'resourceSummary';

export type UserOverviewUsageWithUsageTypes = UserOverviewUsage & {
  yearUsage: Record<string, UserStats>;
  monthUsage: Record<string, UserStats>;
  dayUsage: Record<string, UserStats>;
};

export type UsageSummaryWithUsageTypes = UsageSummary & {
  year: Record<string, Record<string, number>>;
  month: Record<string, Record<string, number>>;
  day: Record<string, Record<string, number>>;
};

function getSummaryKey(interval: UsageInterval): keyof UsageSummary {
  switch (interval) {
    case 'DAY':
      return 'day';
    case 'MONTH':
      return 'month';
    case 'YEAR':
      return 'year';
    default:
      return 'year';
  }
}

function getUserUsageKey(
  interval: UsageInterval
): keyof UserOverviewUsageWithUsageTypes {
  switch (interval) {
    case 'DAY':
      return 'dayUsage';
    case 'MONTH':
      return 'monthUsage';
    case 'YEAR':
      return 'yearUsage';
    default:
      return 'yearUsage';
  }
}

function createDefaultUserStats(): UserStats {
  return {
    mostUsedEndpoint: '',
    mostUsedPublicEndpoint: '',
    maxUsageProportion: 0,
    publicMaxUsageProportion: 0,
    totalUsage: 0,
    totalPublicUsage: 0,
  };
}

export function createEmptyUsageSummary(): UsageSummaryWithUsageTypes {
  return {
    day: {},
    month: {},
    year: {},
  };
}

export function buildUsageSummaryFromRows(
  rowsByInterval: RowsByInterval<ResourceUsageAnalysisRow>
): UsageSummaryWithUsageTypes {
  const summary = createEmptyUsageSummary();

  (Object.keys(rowsByInterval) as UsageInterval[]).forEach(interval => {
    const summaryKey = getSummaryKey(interval);
    rowsByInterval[interval].forEach(row => {
      if (!summary[summaryKey][row.time]) {
        summary[summaryKey][row.time] = {};
      }
      summary[summaryKey][row.time][row.resource] = row.usage;
    });
  });

  return summary;
}

export function buildUserOverviewUsageFromRows(
  allUsageRowsByInterval: RowsByInterval<UsageAnalysisRow>,
  publicUsageRowsByInterval: RowsByInterval<UsageAnalysisRow>
): UserOverviewUsageWithUsageTypes[] {
  const userMap = new Map<string, UserOverviewUsageWithUsageTypes>();

  const upsertUser = (row: UsageAnalysisRow) => {
    const userKey = row.userId || row.userEmail;
    const existing = userMap.get(userKey);
    if (existing) {
      return existing;
    }

    const nextUser: UserOverviewUsageWithUsageTypes = {
      userId: row.userId,
      userEmail: row.userEmail,
      dayUsage: {},
      monthUsage: {},
      yearUsage: {},
    };
    userMap.set(userKey, nextUser);
    return nextUser;
  };

  (Object.keys(allUsageRowsByInterval) as UsageInterval[]).forEach(interval => {
    const usageKey = getUserUsageKey(interval);

    allUsageRowsByInterval[interval].forEach(row => {
      const user = upsertUser(row);
      const stats = user[usageKey][row.time] || createDefaultUserStats();
      stats.totalUsage = row.usage;
      stats.mostUsedEndpoint = row.resource;
      stats.maxUsageProportion = row.maxUsageProportion;
      user[usageKey][row.time] = stats;
    });

    publicUsageRowsByInterval[interval].forEach(row => {
      const user = upsertUser(row);
      const stats = user[usageKey][row.time] || createDefaultUserStats();
      stats.totalPublicUsage = row.usage;
      stats.mostUsedPublicEndpoint = row.resource;
      stats.publicMaxUsageProportion = row.maxUsageProportion;
      user[usageKey][row.time] = stats;
    });
  });

  return Array.from(userMap.values());
}

export function isPrivateResource(resource: string) {
  return resource.startsWith('/api/private/');
}

export function toggleValueToInterval(
  toggleValue: TimeToggleValue
): UsageInterval {
  if (toggleValue === TimeToggleValue.RESULTS_BY_YEAR) {
    return 'YEAR';
  }
  if (toggleValue === TimeToggleValue.RESULTS_BY_MONTH) {
    return 'MONTH';
  }
  return 'DAY';
}

export function formatDateForUsageInterval(
  date: string | undefined,
  interval: UsageInterval
) {
  if (!date) {
    return undefined;
  }
  if (interval === 'YEAR') {
    return moment(date).format(TABLE_YEAR_FORMAT);
  }
  if (interval === 'MONTH') {
    return moment(date).format(TABLE_MONTH_FORMAT);
  }
  return moment(date).format(TABLE_DAY_FORMAT);
}

export function buildUsageSort(
  sorted: SortingRule[] | undefined,
  mode: UsageMode
) {
  if (!sorted || sorted.length === 0) {
    return undefined;
  }

  const mappedSort = sorted
    .map(sortRule => {
      const sortId = sortRule.id === 'endpoint' ? 'resource' : sortRule.id;
      if (
        (mode === 'userSummary' &&
          [
            'userId',
            'userEmail',
            'resource',
            'usage',
            'time',
            'maxUsageProportion',
          ].includes(sortId)) ||
        (mode === 'resourceSummary' &&
          ['resource', 'usage', 'time'].includes(sortId))
      ) {
        return `${sortId},${sortRule.desc ? 'desc' : 'asc'}`;
      }
      return undefined;
    })
    .filter((sortRule): sortRule is string => sortRule !== undefined);

  return mappedSort.length > 0 ? mappedSort : undefined;
}

export function getTotalPages(totalCount: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

export function getTotalCountFromHeaders(headers: {
  [key: string]: string | string[] | undefined;
}) {
  const value = headers['x-total-count'];
  const normalized = Array.isArray(value) ? value[0] : value;
  const totalCount = normalized ? Number(normalized) : 0;
  return Number.isFinite(totalCount) ? totalCount : 0;
}

function checkIfUserUsage(
  incomingData: UsageSummaryWithUsageTypes | UserOverviewUsageWithUsageTypes[]
): incomingData is UserOverviewUsageWithUsageTypes[] {
  return Array.isArray(incomingData);
}

function createResourceTableRecord(
  time: string,
  usageSummary: Record<string, number>,
  keyType: 'resource' | 'email',
  isAllUsage: boolean
): UsageRecord[] {
  return Object.entries(usageSummary)
    .filter(([key]) => isAllUsage || !isPrivateResource(key))
    .map(
      ([key, usage]): UsageRecord => {
        return {
          userId: undefined,
          userEmail: keyType === 'email' ? key : '',
          usage,
          time,
          resource: keyType === 'resource' ? key : '',
          maxUsageProportion: 0,
        };
      }
    );
}

function createUserTableRecord(
  userId: string | undefined,
  userEmail: string,
  usage: Record<string, UserStats>,
  isAllUsage: boolean
): UsageRecord[] {
  return Object.entries(usage).map(
    ([time, userStats]): UsageRecord => {
      return {
        userId,
        userEmail,
        usage: isAllUsage ? userStats.totalUsage : userStats.totalPublicUsage,
        time,
        resource: isAllUsage
          ? userStats.mostUsedEndpoint
          : userStats.mostUsedPublicEndpoint,
        maxUsageProportion: isAllUsage
          ? userStats.maxUsageProportion
          : userStats.publicMaxUsageProportion,
      };
    }
  );
}

export function mapUserOrResourceUsageToUsageRecords(
  incomingData: UsageSummaryWithUsageTypes | UserOverviewUsageWithUsageTypes[],
  timeTypeToggleValue: TimeToggleValue,
  filterToggled: boolean,
  fromDate: string | undefined,
  toDate: string | undefined,
  isAllUsage: boolean
) {
  let data: UsageRecord[];
  const isByYear = timeTypeToggleValue === TimeToggleValue.RESULTS_BY_YEAR;
  const isByMonth = timeTypeToggleValue === TimeToggleValue.RESULTS_BY_MONTH;
  const isByDay = timeTypeToggleValue === TimeToggleValue.RESULTS_BY_DAY;

  if (isByYear && checkIfUserUsage(incomingData)) {
    data = incomingData.flatMap(({ userId, userEmail, yearUsage }) => {
      return createUserTableRecord(userId, userEmail, yearUsage, isAllUsage);
    });
  } else if (isByMonth && checkIfUserUsage(incomingData)) {
    data = incomingData.flatMap(({ userId, userEmail, monthUsage }) => {
      return createUserTableRecord(userId, userEmail, monthUsage, isAllUsage);
    });
  } else if (isByDay && checkIfUserUsage(incomingData)) {
    data = incomingData.flatMap(({ userId, userEmail, dayUsage }) => {
      return createUserTableRecord(userId, userEmail, dayUsage, isAllUsage);
    });
  } else if (isByYear && !checkIfUserUsage(incomingData)) {
    data = Object.entries(incomingData.year).flatMap(([time, usageSummary]) => {
      return createResourceTableRecord(
        time,
        usageSummary,
        'resource',
        isAllUsage
      );
    });
  } else if (isByMonth && !checkIfUserUsage(incomingData)) {
    data = Object.entries(incomingData.month).flatMap(
      ([time, usageSummary]) => {
        return createResourceTableRecord(
          time,
          usageSummary,
          'resource',
          isAllUsage
        );
      }
    );
  } else if (isByDay && !checkIfUserUsage(incomingData)) {
    data = Object.entries(incomingData.day).flatMap(([time, usageSummary]) => {
      return createResourceTableRecord(
        time,
        usageSummary,
        'resource',
        isAllUsage
      );
    });
  } else {
    data = [];
  }

  if (filterToggled && data.length > 0) {
    let tableFormat: string;
    if (timeTypeToggleValue === TimeToggleValue.RESULTS_BY_MONTH) {
      tableFormat = TABLE_MONTH_FORMAT;
    } else if (timeTypeToggleValue === TimeToggleValue.RESULTS_BY_DAY) {
      tableFormat = TABLE_DAY_FORMAT;
    } else {
      tableFormat = TABLE_YEAR_FORMAT;
    }
    data = data.filter(resource => {
      const fromTime = moment(fromDate).format(tableFormat);
      const toTime = moment(toDate).format(tableFormat);
      return resource.time >= fromTime && resource.time <= toTime;
    });
  }

  return data;
}

export function mapUsageSummaryToTimeGroupedUsageRecords(
  usageSummary: UsageSummaryWithUsageTypes,
  keyType: Parameters<typeof createResourceTableRecord>[2]
): TimeGroupedUsageRecords {
  return {
    [USAGE_YEAR_DETAIL_TIME_KEY]: Object.entries(
      usageSummary.year
    ).flatMap(([time, usage]) =>
      createResourceTableRecord(time, usage, keyType, true)
    ),
    [USAGE_MONTH_DETAIL_TIME_KEY]: Object.entries(
      usageSummary.month
    ).flatMap(([time, usage]) =>
      createResourceTableRecord(time, usage, keyType, true)
    ),
    [USAGE_DAY_DETAIL_TIME_KEY]: Object.entries(
      usageSummary.day
    ).flatMap(([time, usage]) =>
      createResourceTableRecord(time, usage, keyType, true)
    ),
  };
}

export function buildTimeGroupedUsageRecordsFromUserSummaryRows(
  rowsByInterval: RowsByInterval<UsageAnalysisRow>
): TimeGroupedUsageRecords {
  return {
    [USAGE_YEAR_DETAIL_TIME_KEY]: rowsByInterval.YEAR.map(row => ({
      userId: row.userId,
      userEmail: row.userEmail,
      usage: row.usage,
      time: row.time,
      resource: '',
      maxUsageProportion: row.maxUsageProportion,
    })),
    [USAGE_MONTH_DETAIL_TIME_KEY]: rowsByInterval.MONTH.map(row => ({
      userId: row.userId,
      userEmail: row.userEmail,
      usage: row.usage,
      time: row.time,
      resource: '',
      maxUsageProportion: row.maxUsageProportion,
    })),
    [USAGE_DAY_DETAIL_TIME_KEY]: rowsByInterval.DAY.map(row => ({
      userId: row.userId,
      userEmail: row.userEmail,
      usage: row.usage,
      time: row.time,
      resource: '',
      maxUsageProportion: row.maxUsageProportion,
    })),
  };
}
