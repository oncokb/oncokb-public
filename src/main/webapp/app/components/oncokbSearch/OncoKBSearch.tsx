import React from 'react';
import { ExtendedTypeaheadSearchResp } from 'app/pages/HomePage';
import Select from 'react-select';
import {
  SearchOption,
  SearchOptionType,
} from 'app/components/searchOption/SearchOption';
import { components } from 'react-select';
import { RouterStore } from 'mobx-react-router';
import oncokbPrivateClient from 'app/shared/api/oncokbPrivateClientInstance';
import {
  getAllAlterationsName,
  getAllTumorTypesName,
} from 'app/shared/utils/Utils';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import _ from 'lodash';
import AppStore from 'app/store/AppStore';
import SearchInfoIcon from 'app/components/oncokbSearch/SearchInfoIcon';
import { remoteData } from 'cbioportal-frontend-commons';

interface IOncoKBSearch {
  routing?: RouterStore;
  styles?: CSSRule;
  appStore?: AppStore;
}

@inject('routing', 'appStore')
@observer
export default class OncoKBSearch extends React.Component<IOncoKBSearch, {}> {
  @observable keyword: string;
  @observable selectInput: string;
  @observable selectedOption: ExtendedTypeaheadSearchResp | null;

  private timeout: any;

  readonly options = remoteData<ExtendedTypeaheadSearchResp[]>({
    invoke: async () => {
      try {
        return _.reduce(
          await oncokbPrivateClient.searchTypeAheadGetUsingGET({
            query: this.keyword,
            limit: 20,
          }),
          (acc, result) => {
            acc.push({
              tumorTypesName: getAllTumorTypesName(result.tumorTypes),
              alterationsName: getAllAlterationsName(result.variants),
              ...result,
            });
            return acc;
          },
          [] as ExtendedTypeaheadSearchResp[]
        );
      } catch (error) {
        const errorOptions: ExtendedTypeaheadSearchResp[] = [];
        if (error) {
          const errorContent = [];
          if (error.name) {
            errorContent.push(error.name);
          }
          if (error.message) {
            errorContent.push(error.message);
          }
          errorOptions.push({
            queryType: 'TEXT',
            annotation: `Error on fetching result ${errorContent.join(' ')}`,
          } as ExtendedTypeaheadSearchResp);
        }
        return errorOptions;
      }
    },
  });

  private debouncedUpdate = (searchTerm: string) => {
    this.selectInput = searchTerm;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.keyword = searchTerm;
    }, 500);
  };

  render() {
    const Option: React.FunctionComponent<any> = (props: any) => {
      return (
        <>
          <components.Option {...props}>
            <SearchOption
              search={this.keyword}
              type={props.data.queryType as SearchOptionType}
              data={props.data}
              appStore={this.props.appStore!}
            >
              <components.Option {...props} />
            </SearchOption>
          </components.Option>
        </>
      );
    };
    const NoOptionsMessage: React.FunctionComponent<any> = (props: any) => {
      if (this.keyword) {
        return (
          <components.Option {...props}>
            <span>No result found</span>
          </components.Option>
        );
      } else {
        return null;
      }
    };

    return (
      <div className={'d-flex align-items-center'}>
        <div className={'flex-grow-1'}>
          <Select
            placeholder="Search Gene / Alteration / Cancer Type / Drug / Genomic Variant"
            components={{
              Option,
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
              NoOptionsMessage,
            }}
            styles={{
              input(styles) {
                return {
                  ...styles,
                  lineHeight: '30px',
                };
              },
              placeholder(styles) {
                return {
                  ...styles,
                  width: '90%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  lineHeight: '30px',
                  textAlign: 'center',
                };
              },
            }}
            defaultOptions={[] as ExtendedTypeaheadSearchResp[]}
            menuIsOpen={!!this.keyword}
            isClearable={true}
            value={this.selectedOption}
            onChange={(value: ExtendedTypeaheadSearchResp, props) => {
              if (value) {
                this.keyword = '';
                this.selectInput = '';
                // We need to update the history in the onchange event so when user hits the enter key after search, it would work
                this.props.routing!.history.push(value.link);
              }
            }}
            closeMenuOnSelect={false}
            inputValue={this.selectInput}
            onInputChange={this.debouncedUpdate}
            isLoading={this.options.isPending}
            options={this.options.isPending ? [] : this.options.result}
            // do not filter any option, that's down through the server side
            filterOption={() => true}
          />
        </div>
        <div className={'ml-2'}>
          <SearchInfoIcon
            onSelectQuery={newQuery => {
              this.selectInput = newQuery;
              this.keyword = newQuery;
            }}
          />
        </div>
      </div>
    );
  }
}
