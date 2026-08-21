import React from 'react';
import ReactTable, { Column, TableProps } from 'react-table';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';
import classNames from 'classnames';
import { Button } from 'reactstrap';
import { FilterIconModal } from 'app/components/oncokbTable/filters/FilterIconModal';
import { FilterTypes } from 'app/components/oncokbTable/filters/types';

export type BaseColumn<T> = Column<T> & {
  onFilter?: (data: T, keyword: string) => boolean;
  disableHeaderFiltering?: boolean;
};

export type StringFilterColumn<T> = BaseColumn<T> & {
  filterType: FilterTypes.STRING;
  getColumnFilterValue: (data: T) => string | undefined;
  sortColumnFilterValues?: (a: string, b: string) => number;
};

export type NumberFilterColumn<T> = BaseColumn<T> & {
  filterType: FilterTypes.NUMBER;
  getColumnFilterValue: (data: T) => number | undefined;
  sortColumnFilterValues?: (a: number, b: number) => number;
};

export type UnfilteredColumn<T> = BaseColumn<T> & {
  filterType?: undefined;
  getColumnFilterValue?: undefined;
  sortColumnFilterValues?: undefined;
};

export type SearchColumn<T> =
  | StringFilterColumn<T>
  | NumberFilterColumn<T>
  | UnfilteredColumn<T>;

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
  description?: React.ReactNode;
  className?: string;
  serverSideSearch?: boolean;
  searchKeyword?: string;
  onSearchChange?: (keyword: string) => void;
}

function defaultFilterValueComparator(
  a: string | number,
  b: string | number
): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function sortColumnFilterValues(
  values: Set<string | number>,
  comparator?: (a: never, b: never) => number
): Set<string | number> {
  const sort =
    (comparator as (a: string | number, b: string | number) => number) ??
    defaultFilterValueComparator;
  return new Set(Array.from(values).sort(sort));
}

function getColumnId<T>(column: SearchColumn<T>): string | undefined {
  if (column.id) {
    return column.id;
  }
  return typeof column.accessor === 'string' ? column.accessor : undefined;
}

@observer
export default class OncoKBTable<T> extends React.Component<
  ITableWithSearchBox<T>,
  {}
> {
  @observable searchKeyword = '';
  @observable selectedFilters: {
    [columnId: string]: Set<string> | Set<number>;
  } = {};

  public static defaultProps = {
    disableSearch: false,
    showPagination: false,
    searchIconClassName: 'fa fa-search',
  };

  @computed
  get filterableColumns() {
    if (this.props.serverSideSearch) {
      return [];
    }
    return this.props.columns.filter(
      column =>
        !!column.filterType &&
        !column.disableHeaderFiltering &&
        !!getColumnId(column)
    );
  }

  @computed
  get hasActiveFilters() {
    return Object.keys(this.selectedFilters).some(
      columnId => this.selectedFilters[columnId].size > 0
    );
  }

  @computed
  get allUniqColumnData(): { [columnId: string]: Set<string | number> } {
    const allColumnData: { [columnId: string]: Set<string | number> } = {};

    this.filterableColumns.forEach(column => {
      allColumnData[getColumnId(column)!] = new Set<string | number>();
    });

    this.props.data.forEach(item => {
      this.filterableColumns.forEach(column => {
        const filterValue = column.getColumnFilterValue!(item);
        if (filterValue !== undefined && filterValue !== '') {
          allColumnData[getColumnId(column)!].add(filterValue);
        }
      });
    });

    this.filterableColumns.forEach(column => {
      const columnId = getColumnId(column)!;
      allColumnData[columnId] = sortColumnFilterValues(
        allColumnData[columnId],
        column.sortColumnFilterValues
      );
    });

    return allColumnData;
  }

  @computed
  get filteredData() {
    if (this.props.serverSideSearch) {
      return this.props.data;
    }
    return this.props.data.filter((item: T) => {
      const columnFilterResult = this.filterableColumns.every(column => {
        const selectedValues = this.selectedFilters[getColumnId(column)!];
        if (!selectedValues || selectedValues.size === 0) {
          return true;
        }

        const value = column.getColumnFilterValue!(item);

        switch (column.filterType) {
          case FilterTypes.STRING:
            return (
              typeof value === 'string' &&
              (selectedValues as Set<string>).has(value)
            );
          case FilterTypes.NUMBER:
            return (
              typeof value === 'number' &&
              (selectedValues as Set<number>).has(value)
            );
          default:
            return true;
        }
      });

      const searchableColumns = this.props.columns.filter(
        column => !!column.onFilter
      );
      const keywordSearchResult =
        searchableColumns.length > 0
          ? searchableColumns
              .map(column => column.onFilter!(item, this.searchKeyword))
              .includes(true)
          : true;

      return columnFilterResult && keywordSearchResult;
    });
  }

  @computed
  get columnsWithFilters(): SearchColumn<T>[] {
    if (this.filterableColumns.length === 0) {
      return this.props.columns;
    }
    return this.props.columns.map(column => {
      const columnId = getColumnId(column);
      if (
        !columnId ||
        !this.filterableColumns.some(
          filterableColumn => getColumnId(filterableColumn) === columnId
        )
      ) {
        return column;
      }
      return {
        ...column,
        Header: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{column.Header}</span>
            <FilterIconModal
              id={columnId}
              filterType={column.filterType!}
              allSelections={this.allUniqColumnData[columnId] as Set<any>}
              currSelections={
                (this.selectedFilters[columnId] as Set<any>) || new Set()
              }
              updateSelections={newSelections =>
                this.handleFilterChange(
                  columnId,
                  newSelections as Set<string> | Set<number>
                )
              }
            />
          </div>
        ),
      };
    });
  }

  handleFilterChange = (
    columnId: string,
    selectedValues: Set<string> | Set<number>
  ) => {
    this.selectedFilters = {
      ...this.selectedFilters,
      [columnId]: selectedValues,
    };
  };

  render() {
    const sorted = this.props.sorted ? [...this.props.sorted] : undefined;
    const defaultSorted = this.props.defaultSorted
      ? [...this.props.defaultSorted]
      : undefined;
    const pageSize =
      this.hasActiveFilters &&
      !this.props.showPagination &&
      this.props.pageSize !== undefined
        ? Math.max(this.filteredData.length, 1)
        : this.props.pageSize;

    return (
      <div>
        {this.props.filters === undefined &&
        this.props.description === undefined &&
        this.props.disableSearch &&
        !this.hasActiveFilters ? (
          <></>
        ) : (
          <div
            className={classNames('row', {
              'align-items-end': this.props.description !== undefined,
            })}
          >
            {this.props.description !== undefined && (
              <div className="col-sm">{this.props.description}</div>
            )}
            <div className="col-auto">
              {this.props.filters === undefined ? (
                <></>
              ) : (
                <this.props.filters />
              )}
            </div>
            <div
              className={
                this.props.description !== undefined ? 'col-sm-4' : 'col-sm'
              }
            >
              {this.props.disableSearch && !this.hasActiveFilters ? (
                <></>
              ) : (
                <div className="d-flex">
                  <div className="ml-auto d-flex align-items-center">
                    {this.hasActiveFilters && (
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        className="mr-2"
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={() => (this.selectedFilters = {})}
                      >
                        Reset all filters
                      </Button>
                    )}
                    {!this.props.disableSearch && (
                      <input
                        onChange={(event: any) => {
                          const newKeyword = event.target.value.toLowerCase();
                          if (this.props.onSearchChange) {
                            this.props.onSearchChange(newKeyword);
                          } else {
                            this.searchKeyword = newKeyword;
                          }
                        }}
                        value={
                          this.props.onSearchChange
                            ? this.props.searchKeyword || ''
                            : this.searchKeyword
                        }
                        className="form-control input-sm"
                        type="text"
                        placeholder="Search ..."
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-2">
          <ReactTable
            {...this.props}
            sorted={sorted}
            defaultSorted={defaultSorted}
            showPagination={this.props.showPagination}
            className={classNames(
              `-striped -highlight oncokbReactTable ${
                this.props.fixedHeight ? 'fixedHeight' : ''
              }`,
              this.props.className
            )}
            data={this.filteredData}
            columns={this.columnsWithFilters}
            pageSize={pageSize}
          />
        </div>
      </div>
    );
  }
}
