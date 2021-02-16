import React from 'react';
import { ExtendedTypeaheadSearchResp } from 'app/pages/HomePage';
import AsyncSelect from 'react-select/async';
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
import autobind from 'autobind-decorator';
import { action, observable } from 'mobx';
import _ from 'lodash';
import AppStore from 'app/store/AppStore';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import { FeedbackType } from 'app/components/feedback/types';

interface IOncoKBSearch {
  routing?: RouterStore;
  styles?: CSSRule;
  appStore?: AppStore;
}

@inject('routing', 'appStore')
@observer
export default class OncoKBSearch extends React.Component<IOncoKBSearch, {}> {
  @observable keyword: string;
  @observable selectedOption: ExtendedTypeaheadSearchResp | null;

  @autobind
  @action
  async getOptions(keyword: string) {
    this.keyword = keyword;
    return _.reduce(
      await oncokbPrivateClient.searchTypeAheadGetUsingGET({
        query: keyword,
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
  }

  // https://github.com/JedWatson/react-select/issues/614#issuecomment-244006496
  private debouncedFetch = _.debounce((searchTerm, callback) => {
    this.getOptions(searchTerm)
      .then(result => {
        return callback(result);
      })
      .catch((error: any) => callback(error, null));
  }, 500);

  render() {
    const Option: React.FunctionComponent<any> = (props: any) => {
      return (
        <>
          <components.Option {...props}>
            <SearchOption
              search={this.keyword}
              type={props.data.queryType as SearchOptionType}
              data={props.data}
              appStore={props.appStore}
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
            <span className="mr-2">
              No result found, please send us an email if you would like{' '}
              {this.keyword} to be curated.
            </span>
            <FeedbackIcon
              feedback={{
                type: FeedbackType.ANNOTATION,
              }}
              appStore={this.props.appStore!}
            />
          </components.Option>
        );
      } else {
        return null;
      }
    };

    return (
      <AsyncSelect
        placeholder="Search Gene / Alteration / Drug"
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
              width: '100%',
              lineHeight: '30px',
              textAlign: 'center',
            };
          },
        }}
        isFocused={true}
        defaultOptions={[] as ExtendedTypeaheadSearchResp[]}
        menuIsOpen={!!this.keyword}
        isClearable={true}
        value={this.selectedOption}
        onChange={(value: ExtendedTypeaheadSearchResp, props) => {
          if (value) {
            this.keyword = '';
            this.selectedOption = null;
            // We need to update the history in the onchange event so when user hits the enter key after search, it would work
            this.props.routing!.history.push(value.link);
          }
        }}
        closeMenuOnSelect={false}
        loadOptions={this.debouncedFetch}
        inputValue={this.keyword}
        onInputChange={(keyword: string) => {
          this.keyword = keyword;
        }}
      />
    );
  }
}
