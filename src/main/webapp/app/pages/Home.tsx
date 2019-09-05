import * as React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { remoteData } from 'cbioportal-frontend-commons';
import oncokbPrivateClient from '../shared/api/oncokbPrivateClientInstance';
import { TypeaheadSearchResp } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import autobind from 'autobind-decorator';

interface IHomeProps {
  content: string;
}

@observer
class Home extends React.Component<IHomeProps> {
  @observable keyword: string;

  readonly searchOptions = remoteData<TypeaheadSearchResp[]>({
    await: () => [],
    invoke: async () => {
      return oncokbPrivateClient.searchTypeAheadGetUsingGET({
        query: this.keyword
      });
    },
    default: []
  });

  @autobind
  @action
  onSearch(keyword: string) {
    this.keyword = keyword;
  }

  public render() {
    return (
      <div>
        <AsyncTypeahead
          id={'mainSearch'}
          isLoading={this.searchOptions.isPending}
          options={this.searchOptions.result}
          labelKey={(option: TypeaheadSearchResp) => `${option.link} ${option.annotation}`}
          onSearch={this.onSearch}
          placeholder="Search Gene / Alteration / Drug"
          renderMenuItemChildren={(option: TypeaheadSearchResp, props) => <div>{option.link}</div>}
        />
      </div>
    );
  }
}

export default Home;
