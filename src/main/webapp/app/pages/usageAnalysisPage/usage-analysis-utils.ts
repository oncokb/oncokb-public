import {
  UserStats,
  UsageSummary,
  UserOverviewUsage,
  UserUsage,
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

export enum ToggleValue {
  ALL_RESOURCES = 'All Resources',
  PUBLIC_RESOURCES = 'Only Public Resources',
  CUMULATIVE_USAGE = 'Cumulative Usage',
  RESULTS_BY_YEAR = 'By Year',
  RESULTS_BY_MONTH = 'By Month',
  RESULTS_BY_DAY = 'By Day',
}

export type TimeGroupedUsageRecords = {
  [USAGE_YEAR_DETAIL_TIME_KEY]: UsageRecord[];
  [USAGE_MONTH_DETAIL_TIME_KEY]: UsageRecord[];
  [USAGE_DAY_DETAIL_TIME_KEY]: UsageRecord[];
};

export type UsageRecord = {
  resource: string;
  userEmail: string;
  maxUsageProportion: number;
  usage: number;
  time: string;
  userId?: string;
};

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

export function isPrivateResource(resource: string) {
  return resource.startsWith('/api/private/');
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
  timeTypeToggleValue: ToggleValue,
  filterToggled: boolean,
  fromDate: string | undefined,
  toDate: string | undefined,
  isAllUsage: boolean
) {
  let data: UsageRecord[];
  const isByYear = timeTypeToggleValue === ToggleValue.RESULTS_BY_YEAR;
  const isByMonth = timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH;
  const isByDay = timeTypeToggleValue === ToggleValue.RESULTS_BY_DAY;

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
    data = Object.entries(incomingData.day).flatMap(([time, usageSummary]) => {
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
    if (timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH) {
      tableFormat = TABLE_MONTH_FORMAT;
    } else if (timeTypeToggleValue === ToggleValue.RESULTS_BY_DAY) {
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
