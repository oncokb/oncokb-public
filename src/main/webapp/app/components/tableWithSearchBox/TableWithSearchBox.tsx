import React from 'react';
import ReactTable, { Column, SortingRule } from 'react-table';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';

export type SearchColumn<T> = Column<T> & {
  onFilter?: (data: T, keyword: string) => boolean;
};

interface ITableWithSearchBox<T> {
  data: T[];
  columns: SearchColumn<T>[];
  isLoading: boolean;
  defaultSorted: SortingRule[];
}

@observer
export default class TableWithSearchBox<T> extends React.Component<ITableWithSearchBox<T>, {}> {
  @observable searchKeyword = '';

  @computed
  get filteredData() {
    return this.props.data.filter((item: T) => {
      const filterableColumns = this.props.columns.filter(column => !!column.onFilter);
      if (filterableColumns.length > 0) {
        return filterableColumns.map(column => column.onFilter!(item, this.searchKeyword)).includes(true);
      } else {
        return true;
      }
    });
  }

  render() {
    return (
      <div>
        <div className="d-flex">
          <div className="ml-auto">
            <input
              onChange={(event: any) => {
                this.searchKeyword = event.target.value.toLowerCase();
              }}
              className="form-control input-sm"
              type="text"
              placeholder="Search ..."
            />
          </div>
        </div>
        <div className="mt-2">
          <ReactTable
            data={this.filteredData}
            loading={this.props.isLoading}
            columns={this.props.columns}
            showPagination={true}
            defaultSortDesc={true}
            defaultSorted={this.props.defaultSorted}
            className="-striped -highlight"
          />
        </div>
      </div>
    );
  }
}
