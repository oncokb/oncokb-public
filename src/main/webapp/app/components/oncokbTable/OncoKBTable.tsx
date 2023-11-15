import React from 'react';
import ReactTable, { Column, TableProps } from 'react-table';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';
import classNames from 'classnames';

export type SearchColumn<T> = Column<T> & {
  onFilter?: (data: T, keyword: string) => boolean;
};

interface ITableWithSearchBox<T> extends Partial<TableProps<T>> {
  data: T[];
  disableSearch?: boolean;
  fixedHeight?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  minRows?: number;
  columns: SearchColumn<T>[];
  loading?: boolean;
  filters?: React.FunctionComponent;
  className?: string;
}

@observer
export default class OncoKBTable<T> extends React.Component<
  ITableWithSearchBox<T>,
  {}
> {
  @observable searchKeyword = '';

  public static defaultProps = {
    disableSearch: false,
    showPagination: false,
    searchIconClassName: 'fa fa-search',
  };

  @computed
  get filteredData() {
    return this.props.data.filter((item: T) => {
      const filterableColumns = this.props.columns.filter(
        column => !!column.onFilter
      );
      if (filterableColumns.length > 0) {
        return filterableColumns
          .map(column => column.onFilter!(item, this.searchKeyword))
          .includes(true);
      } else {
        return true;
      }
    });
  }

  render() {
    return (
      <div>
        {this.props.filters === undefined && this.props.disableSearch ? (
          <></>
        ) : (
          <div className="row">
            <div className="col-auto">
              {this.props.filters === undefined ? (
                <></>
              ) : (
                <this.props.filters />
              )}
            </div>
            <div className="col-sm">
              {this.props.disableSearch ? (
                <></>
              ) : (
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
              )}
            </div>
          </div>
        )}
        <div className="mt-2">
          <ReactTable
            {...this.props}
            showPagination={this.props.showPagination}
            className={classNames(
              `-striped -highlight oncokbReactTable ${
                this.props.fixedHeight ? 'fixedHeight' : ''
              }`,
              this.props.className
            )}
            data={this.filteredData}
          />
        </div>
      </div>
    );
  }
}
