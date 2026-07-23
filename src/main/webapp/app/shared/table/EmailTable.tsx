import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import React from 'react';
import { UserMailsDTO } from 'app/shared/api/generated/API';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { filterByKeyword, toAppTimestampFormat } from 'app/shared/utils/Utils';
import { SortingRule } from 'react-table';

type EmailTableProps = {
  data: UserMailsDTO[];
  defaultPageSize?: number;
  showPagination?: boolean;
  loading?: boolean;
  page?: number;
  pageSize?: number;
  pages?: number;
  manual?: boolean;
  sorted?: SortingRule[];
  onSortedChange?: (newSorted: SortingRule[]) => void;
  onFetchData?: (tableState: any) => void;
  serverSideSearch?: boolean;
  searchKeyword?: string;
  onSearchChange?: (keyword: string) => void;
};
export const EmailTable: React.FunctionComponent<EmailTableProps> = tableProps => {
  const columns: SearchColumn<UserMailsDTO>[] = [
    {
      id: 'mailType',
      Header: <span>Mail Type</span>,
      accessor: 'mailType',
      minWidth: 100,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      onFilter: (data: UserMailsDTO, keyword) =>
        filterByKeyword(data.mailType, keyword),
    },
    {
      id: 'sentDate',
      Header: <span>Sent Date</span>,
      onFilter: (data: UserMailsDTO, keyword) =>
        data.sentDate
          ? filterByKeyword(toAppTimestampFormat(data.sentDate), keyword)
          : false,
      accessor: 'sentDate',
      Cell(props: { original: UserMailsDTO }): any {
        return <div>{toAppTimestampFormat(props.original.sentDate)}</div>;
      },
    },
    {
      id: 'sentFrom',
      Header: <span>Sent From</span>,
      onFilter: (data: UserMailsDTO, keyword) =>
        data.sentFrom ? filterByKeyword(data.sentFrom, keyword) : false,
      accessor: 'sentFrom',
    },
    {
      id: 'sentBy',
      Header: <span>Sent By</span>,
      onFilter: (data: UserMailsDTO, keyword) =>
        data.sentBy ? filterByKeyword(data.sentBy, keyword) : false,
      accessor: 'sentBy',
    },
  ];
  return (
    <OncoKBTable
      defaultSorted={[
        {
          id: 'sentDate',
          desc: true,
        },
      ]}
      data={tableProps.data}
      columns={columns}
      showPagination={tableProps.showPagination !== false}
      loading={tableProps.loading}
      page={tableProps.page}
      pageSize={tableProps.pageSize}
      pages={tableProps.pages}
      manual={tableProps.manual}
      sorted={tableProps.sorted}
      onSortedChange={tableProps.onSortedChange}
      onFetchData={tableProps.onFetchData}
      serverSideSearch={tableProps.serverSideSearch}
      searchKeyword={tableProps.searchKeyword}
      onSearchChange={tableProps.onSearchChange}
      minRows={1}
      defaultPageSize={tableProps.defaultPageSize}
    />
  );
};
