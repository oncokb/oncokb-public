import React from 'react';
import ReactTable, { Column, TableProps } from 'react-table';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';
import classNames from 'classnames';
import { COLOR_BLUE } from './../../config/theme';
import {
  HandleColumnsChange,
  MUTATIONS_TABLE_COLUMN_KEY,
  TREATMENTS_TABLE_COLUMN_KEY,
} from './../../config/constants';
import Select, { StylesConfig } from 'react-select';

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
  tableName: string;
  selectedColumnsState: string[];
  selectedColumns: {
    key: MUTATIONS_TABLE_COLUMN_KEY | TREATMENTS_TABLE_COLUMN_KEY;
    label: string;
    prop: string;
  }[];
  handleColumnsChange: HandleColumnsChange;
}

const colourStyles: StylesConfig = {
  control: (styles: any) => ({ ...styles, backgroundColor: 'white' }),
  option(
    styles: any,
    {
      isDisabled,
      isFocused,
      isSelected,
    }: { isDisabled: boolean; isFocused: boolean; isSelected: boolean }
  ) {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? COLOR_BLUE
        : isFocused
        ? 'rgba(0, 123, 255, 0.1)'
        : undefined,
      color: isDisabled ? '#ccc' : isSelected ? 'white' : COLOR_BLUE,
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled
          ? isSelected
            ? COLOR_BLUE
            : 'rgba(0, 123, 255, 0.1)'
          : 'rgba(0, 123, 255, 0.1)',
      },
    };
  },
  multiValue(styles: any) {
    return {
      ...styles,
      marginTop: '3px',
      paddingLeft: '3px',
      paddingRight: '3px',
      color: COLOR_BLUE,
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
    };
  },
  multiValueLabel: (styles: any) => ({
    ...styles,
    color: COLOR_BLUE,
    backgroundColor: undefined,
  }),
  multiValueRemove: (styles: any) => ({
    ...styles,
    color: COLOR_BLUE,
    ':hover': {
      backgroundColor: COLOR_BLUE,
      color: 'white',
    },
  }),
};

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
    const NoDataConst = (props: string) => (
      <div className="text-center justify-center mb-3">No Results</div>
    );

    return (
      <div>
        {this.props.disableSearch ? (
          <></>
        ) : (
          <>
            <div className="d-flex space-between">
              <h4 className="mt-1" style={{ color: COLOR_BLUE }}>
                {this.props.tableName}
              </h4>
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
            <div className="my-3 mb-4">
              <Select
                isMulti
                options={this.props.selectedColumns.map(col => ({
                  value: col.key,
                  label: col.label,
                }))}
                value={this.props.selectedColumnsState.map(col => {
                  const column = this.props.selectedColumns.find(
                    c => c.key === col
                  );
                  return {
                    value: column?.key,
                    label: column?.label,
                  };
                })}
                onChange={this.props.handleColumnsChange}
                styles={colourStyles}
              />
            </div>
          </>
        )}

        <div className="mt-2">
          <ReactTable
            {...this.props}
            showPagination={this.props.showPagination}
            className={classNames(
              `-highlight oncokbReactTable ${
                this.props.fixedHeight ? 'fixedHeight' : ''
              }`,
              this.props.className
            )}
            data={this.filteredData}
            NoDataComponent={NoDataConst}
          />
        </div>
      </div>
    );
  }
}
