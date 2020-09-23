import OncoKBTable, {
  SearchColumn
} from 'app/components/oncokbTable/OncoKBTable';
import React from 'react';
import { UserMailsDTO } from 'app/shared/api/generated/API';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { filterByKeyword, toAppTimestampFormat } from 'app/shared/utils/Utils';

type EmailTableProps = {
  data: UserMailsDTO[];
};
export const EmailTable: React.FunctionComponent<EmailTableProps> = tablProps => {
  const columns: SearchColumn<UserMailsDTO>[] = [
    {
      id: 'mailType',
      Header: <span>Mail Type</span>,
      accessor: 'mailType',
      minWidth: 100,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      onFilter: (data: UserMailsDTO, keyword) =>
        filterByKeyword(data.mailType, keyword)
    },
    {
      id: 'sentDate',
      Header: <span>Sent Date</span>,
      onFilter: (data: UserMailsDTO, keyword) =>
        data.sentDate
          ? filterByKeyword(toAppTimestampFormat(data.sentDate), keyword)
          : false,
      accessor: 'createdDate',
      Cell(props: { original: UserMailsDTO }): any {
        return <div>{toAppTimestampFormat(props.original.sentDate)}</div>;
      }
    },
    {
      id: 'sentFrom',
      Header: <span>Sent From</span>,
      onFilter: (data: UserMailsDTO, keyword) =>
        data.sentFrom ? filterByKeyword(data.sentFrom, keyword) : false,
      accessor: 'sentFrom'
    },
    {
      id: 'sentBy',
      Header: <span>Sent By</span>,
      onFilter: (data: UserMailsDTO, keyword) =>
        data.sentBy ? filterByKeyword(data.sentBy, keyword) : false,
      accessor: 'sentBy'
    }
  ];
  return (
    <OncoKBTable
      defaultSorted={[
        {
          id: 'sentDate',
          desc: true
        }
      ]}
      data={tablProps.data}
      columns={columns}
      showPagination={true}
      minRows={1}
    />
  );
};
