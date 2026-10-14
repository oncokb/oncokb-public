import React from 'react';
import ReactTable, { Column, TableProps } from 'react-table';
import { observer } from 'mobx-react';
import {
  observable,
  computed,
  action,
  reaction,
  IReactionDisposer,
} from 'mobx';
import classNames from 'classnames';
import { Button } from 'reactstrap';
import { FilterIconModal } from 'app/components/oncokbTable/filters/FilterIconModal';
import {
  FilterTypes,
  isActiveColumnFilter,
} from 'app/components/oncokbTable/filters/types';
import { matchesCancerTypeFilter } from 'app/components/oncokbTable/filters/cancerTypeFilterUtils';
import { LEVELS } from 'app/config/constants';

export type BaseColumn<T> = Column<T> & {
  onFilter?: (data: T, keyword: string) => boolean;
  disableHeaderFiltering?: boolean;
};

export type StringFilterColumn<T> = BaseColumn<T> & {
  filterType: FilterTypes.STRING;
  getColumnFilterValue: (data: T) => string | string[] | undefined;
  sortColumnFilterValues?: (a: string, b: string) => number;
};

export type NumberFilterColumn<T> = BaseColumn<T> & {
  filterType: FilterTypes.NUMBER;
  getColumnFilterValue: (data: T) => number | undefined;
  sortColumnFilterValues?: (a: number, b: number) => number;
};

export type LevelFilterColumn<T> = BaseColumn<T> & {
  filterType: FilterTypes.LEVEL;
  getColumnFilterValue: (data: T) => LEVELS | LEVELS[] | undefined;
  sortColumnFilterValues?: undefined;
};

export type CancerTypeFilterColumn<T> = BaseColumn<T> & {
  filterType: FilterTypes.CANCER_TYPE;
  getColumnFilterValue: (data: T) => string[] | undefined;
  getColumnExcludedFilterValue: (data: T) => string[] | undefined;
  sortColumnFilterValues?: undefined;
};

export type UnfilteredColumn<T> = BaseColumn<T> & {
  filterType?: undefined;
  getColumnFilterValue?: undefined;
  sortColumnFilterValues?: undefined;
};

export type SearchColumn<T> =
  | StringFilterColumn<T>
  | NumberFilterColumn<T>
  | LevelFilterColumn<T>
  | CancerTypeFilterColumn<T>
  | UnfilteredColumn<T>;

export type ColumnFilters = {
  [columnId: string]: Set<string> | Set<number> | Set<LEVELS>;
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
  serverSideSearch?: boolean;
  searchKeyword?: string;
  onSearchChange?: (keyword: string) => void;
  columnFilters?: ColumnFilters;
  onColumnFiltersChange?: (filters: ColumnFilters) => void;
}

const naturalCollator = new Intl.Collator(undefined, { numeric: true });

function defaultFilterValueComparator(
  a: string | number,
  b: string | number
): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return naturalCollator.compare(String(a), String(b));
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

const INCREMENTAL_RENDER_BATCH_SIZE = 50;
const INCREMENTAL_RENDER_SCROLL_THRESHOLD = 300;

function getColumnId<T>(column: SearchColumn<T>): string | undefined {
  if (column.id) {
    return column.id;
  }
  return typeof column.accessor === 'string' ? column.accessor : undefined;
}

function getColumnFilterValues<T>(
  column: SearchColumn<T>,
  item: T
): (string | number)[] {
  const value = column.getColumnFilterValue
    ? column.getColumnFilterValue(item)
    : undefined;
  if (value === undefined || value === '') {
    return [];
  }
  return Array.isArray(value) ? value.filter(v => v !== '') : [value];
}

function isFilterableColumn<T>(column: SearchColumn<T>) {
  return (
    !!column.filterType &&
    !column.disableHeaderFiltering &&
    !!getColumnId(column)
  );
}

export function filterByColumnFilters<T>(
  data: T[],
  columns: SearchColumn<T>[],
  columnFilters: ColumnFilters
): T[] {
  const activeColumns = columns.filter(column => {
    const selected = isFilterableColumn(column)
      ? columnFilters[getColumnId(column)!]
      : undefined;
    return isActiveColumnFilter(column.filterType, selected);
  });
  if (activeColumns.length === 0) {
    return data;
  }
  return data.filter(item =>
    activeColumns.every(column => {
      const selectedValues = columnFilters[getColumnId(column)!] as Set<
        string | number
      >;
      const values = getColumnFilterValues(column, item);
      if (column.filterType === FilterTypes.CANCER_TYPE) {
        return matchesCancerTypeFilter(
          values as string[],
          column.getColumnExcludedFilterValue(item) || [],
          selectedValues as Set<string>
        );
      }
      return values.some(value => selectedValues.has(value));
    })
  );
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

  @observable renderedRowCount = INCREMENTAL_RENDER_BATCH_SIZE;
  private scrollContainer: HTMLElement | undefined;
  private tableContainer: HTMLDivElement | null = null;
  private readonly reactions: IReactionDisposer[] = [];

  componentDidMount() {
    this.reactions.push(
      reaction(
        () => this.filteredData,
        () => this.resetRenderedRows(),
        {
          equals: (a: T[], b: T[]) =>
            a.length === b.length && a.every((row, i) => row === b[i]),
        }
      )
    );
    window.addEventListener('resize', this.alignHeaderWithScrollbar);
    this.alignHeaderWithScrollbar();
  }

  componentDidUpdate() {
    this.alignHeaderWithScrollbar();
  }

  componentWillUnmount() {
    this.reactions.forEach(dispose => dispose());
    window.removeEventListener('resize', this.alignHeaderWithScrollbar);
  }

  alignHeaderWithScrollbar = () => {
    if (!this.tableContainer) {
      return;
    }
    const tbody = this.tableContainer.querySelector<HTMLElement>('.rt-tbody');
    if (!tbody) {
      return;
    }
    const scrollbarWidth = `${tbody.offsetWidth - tbody.clientWidth}px`;
    this.tableContainer
      .querySelectorAll<HTMLElement>('.rt-thead')
      .forEach(thead => {
        if (thead.style.paddingRight !== scrollbarWidth) {
          thead.style.paddingRight = scrollbarWidth;
        }
      });
  };

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
    return this.props.columns.filter(isFilterableColumn);
  }

  @computed
  get isControlled() {
    return (
      this.props.columnFilters !== undefined &&
      this.props.onColumnFiltersChange !== undefined
    );
  }

  @computed
  get columnFilters(): ColumnFilters {
    return this.isControlled ? this.props.columnFilters! : this.selectedFilters;
  }

  isColumnFilterActive(columnId: string, filters: ColumnFilters) {
    const column = this.props.columns.find(c => getColumnId(c) === columnId);
    return isActiveColumnFilter(column?.filterType, filters[columnId]);
  }

  @computed
  get hasActiveFilters() {
    return Object.keys(this.columnFilters).some(columnId =>
      this.isColumnFilterActive(columnId, this.columnFilters)
    );
  }

  @computed
  get showResetFiltersButton() {
    return this.hasActiveFilters && !this.isControlled;
  }

  @computed
  get isIncrementallyRendered() {
    return !!this.props.fixedHeight && !this.props.showPagination;
  }

  @action
  resetRenderedRows() {
    this.renderedRowCount = INCREMENTAL_RENDER_BATCH_SIZE;
    if (this.scrollContainer) {
      this.scrollContainer.scrollTop = 0;
    }
  }

  @action.bound
  onTableScroll(event: React.UIEvent<HTMLDivElement>) {
    if (!this.isIncrementallyRendered) {
      return;
    }
    const target = event.target as HTMLElement;
    this.scrollContainer = target;
    const distanceToEnd =
      target.scrollHeight - target.scrollTop - target.clientHeight;
    if (
      distanceToEnd < INCREMENTAL_RENDER_SCROLL_THRESHOLD &&
      this.renderedRowCount < this.filteredData.length
    ) {
      this.renderedRowCount += INCREMENTAL_RENDER_BATCH_SIZE;
    }
  }

  private uniqColumnDataCache:
    | {
        data: T[];
        columns: SearchColumn<T>[];
        result: { [columnId: string]: Set<string | number> };
      }
    | undefined;

  get allUniqColumnData(): { [columnId: string]: Set<string | number> } {
    const cache = this.uniqColumnDataCache;
    if (
      cache &&
      cache.data === this.props.data &&
      cache.columns === this.props.columns
    ) {
      return cache.result;
    }

    const allColumnData: { [columnId: string]: Set<string | number> } = {};

    this.filterableColumns.forEach(column => {
      allColumnData[getColumnId(column)!] = new Set<string | number>();
    });

    this.props.data.forEach(item => {
      this.filterableColumns.forEach(column => {
        getColumnFilterValues(column, item).forEach(filterValue =>
          allColumnData[getColumnId(column)!].add(filterValue)
        );
      });
    });

    this.filterableColumns.forEach(column => {
      const columnId = getColumnId(column)!;
      allColumnData[columnId] = sortColumnFilterValues(
        allColumnData[columnId],
        column.sortColumnFilterValues
      );
    });

    this.uniqColumnDataCache = {
      data: this.props.data,
      columns: this.props.columns,
      result: allColumnData,
    };
    return allColumnData;
  }

  private availableColumnDataCache:
    | {
        data: T[];
        columns: SearchColumn<T>[];
        columnFilters: ColumnFilters;
        result: { [columnId: string]: Set<string | number> };
      }
    | undefined;

  get availableColumnData(): { [columnId: string]: Set<string | number> } {
    const cache = this.availableColumnDataCache;
    if (
      cache &&
      cache.data === this.props.data &&
      cache.columns === this.props.columns &&
      cache.columnFilters === this.columnFilters
    ) {
      return cache.result;
    }

    const result: { [columnId: string]: Set<string | number> } = {};
    this.filterableColumns.forEach(column => {
      const columnId = getColumnId(column)!;
      const { [columnId]: ownFilter, ...otherFilters } = this.columnFilters;
      const hasOtherFilters = Object.keys(otherFilters).some(otherId =>
        this.isColumnFilterActive(otherId, otherFilters)
      );
      if (!hasOtherFilters) {
        result[columnId] = this.allUniqColumnData[columnId];
        return;
      }
      const values = new Set<string | number>();
      filterByColumnFilters(
        this.props.data,
        this.filterableColumns,
        otherFilters
      ).forEach(item =>
        getColumnFilterValues(column, item).forEach(value => values.add(value))
      );
      result[columnId] = values;
    });

    this.availableColumnDataCache = {
      data: this.props.data,
      columns: this.props.columns,
      columnFilters: this.columnFilters,
      result,
    };
    return result;
  }

  @computed
  get filteredData() {
    if (this.props.serverSideSearch) {
      return this.props.data;
    }
    const searchableColumns = this.props.columns.filter(
      column => !!column.onFilter
    );
    return filterByColumnFilters(
      this.props.data,
      this.filterableColumns,
      this.columnFilters
    ).filter(
      (item: T) =>
        searchableColumns.length === 0 ||
        searchableColumns.some(column =>
          column.onFilter!(item, this.searchKeyword)
        )
    );
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
          <div className="filterable-header">
            <span className="filterable-header-label">{column.Header}</span>
            <FilterIconModal
              id={columnId}
              filterType={column.filterType!}
              allSelections={this.allUniqColumnData[columnId] as Set<any>}
              availableSelections={
                this.availableColumnData[columnId] as Set<any>
              }
              currSelections={this.columnFilters[columnId] as Set<any>}
              updateSelections={newSelections =>
                this.handleFilterChange(
                  columnId,
                  newSelections as Set<string> | Set<number> | undefined
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
    selectedValues: Set<string> | Set<number> | undefined
  ) => {
    const { [columnId]: _, ...otherFilters } = this.columnFilters;
    const newFilters: ColumnFilters = selectedValues
      ? { ...otherFilters, [columnId]: selectedValues }
      : otherFilters;
    if (this.isControlled) {
      this.props.onColumnFiltersChange!(newFilters);
    } else {
      this.selectedFilters = newFilters;
    }
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
    const renderedPageSize =
      this.isIncrementallyRendered && pageSize !== undefined
        ? Math.min(pageSize, this.renderedRowCount)
        : pageSize;

    return (
      <div>
        {this.props.filters === undefined &&
        this.props.disableSearch &&
        !this.showResetFiltersButton ? (
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
              {this.props.disableSearch && !this.showResetFiltersButton ? (
                <></>
              ) : (
                <div className="d-flex">
                  <div className="ml-auto d-flex align-items-center">
                    {this.showResetFiltersButton && (
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
        <div
          className="mt-2"
          onScrollCapture={this.onTableScroll}
          ref={element => (this.tableContainer = element)}
        >
          <ReactTable
            {...this.props}
            sorted={sorted}
            defaultSorted={defaultSorted}
            showPagination={this.props.showPagination}
            className={classNames(
              '-striped -highlight oncokbReactTable',
              this.props.className
            )}
            data={this.filteredData}
            columns={this.columnsWithFilters}
            pageSize={renderedPageSize}
          />
        </div>
      </div>
    );
  }
}
