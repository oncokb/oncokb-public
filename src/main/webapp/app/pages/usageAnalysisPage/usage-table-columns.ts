import {
  operationHeader,
  resourceHeader,
  timeHeader,
  usageHeader,
} from 'app/components/oncokbTable/header-constants';
import { TableCellRenderer } from 'react-table';

export enum UsageTableColumnKey {
  RESOURCES = 'resource',
  USAGE = 'usage',
  TIME = 'time',
  OPERATION = 'operation',
}

export function getUsageTableColumnDefinition(
  columnKey: string
):
  | {
      id: string;
      Header: TableCellRenderer;
      minWidth?: number;
      maxWidth?: number;
      accessor: string;
    }
  | undefined {
  switch (columnKey) {
    case UsageTableColumnKey.RESOURCES:
      return {
        id: UsageTableColumnKey.RESOURCES,
        Header: resourceHeader,
        accessor: UsageTableColumnKey.RESOURCES,
        minWidth: 200,
      };
    case UsageTableColumnKey.USAGE:
      return {
        id: UsageTableColumnKey.USAGE,
        Header: usageHeader,
        minWidth: 100,
        accessor: UsageTableColumnKey.USAGE,
      };
    case UsageTableColumnKey.TIME:
      return {
        id: UsageTableColumnKey.TIME,
        Header: timeHeader,
        minWidth: 100,
        accessor: UsageTableColumnKey.TIME,
      };
    case UsageTableColumnKey.OPERATION:
      return {
        id: UsageTableColumnKey.OPERATION,
        Header: operationHeader,
        maxWidth: 61,
        accessor: UsageTableColumnKey.OPERATION,
      };
    default:
      return undefined;
  }
}
