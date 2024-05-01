import React from 'react';
import { observer } from 'mobx-react';
import Select, { Props as SelectProps } from 'react-select';
import { computed } from 'mobx';
import _ from 'lodash';
import { TumorType } from 'app/shared/api/generated/OncoKbPrivateAPI';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { remoteData } from 'cbioportal-frontend-commons';

interface ICancerTypeSelect extends SelectProps {
  cancerTypes?: string[];
}

@observer
export default class CancerTypeSelect extends React.Component<
  ICancerTypeSelect
> {
  readonly allCancerTypes = remoteData<TumorType[]>({
    await: () => [],
    async invoke() {
      const result = await privateClient.utilsTumorTypesGetUsingGET({});
      return result.sort();
    },
    default: [],
  });

  @computed
  get tumorTypeSelectValue() {
    return (
      this.props.cancerTypes?.map(ct => {
        const matchedSubtype = _.find(
          this.allSubtypes,
          cancerType => cancerType.code === ct
        );
        if (matchedSubtype) {
          return {
            label: matchedSubtype.subtype,
            value: matchedSubtype.code,
          };
        } else {
          return {
            label: ct,
            value: ct,
          };
        }
      }) || []
    );
  }

  @computed
  get allMainTypes() {
    return _.uniq(
      this.allCancerTypes.result
        .filter(cancerType => cancerType.level >= 0)
        .map(cancerType => cancerType.mainType)
    ).sort();
  }

  @computed
  get allSubtypes() {
    return _.uniq(
      this.allCancerTypes.result.filter(cancerType => cancerType.subtype)
    ).sort();
  }

  @computed
  get allTumorTypesOptions() {
    let cancerTypesGroup = this.allMainTypes.filter(
      mainType => !mainType.endsWith('NOS')
    );
    cancerTypesGroup = cancerTypesGroup.concat(
      this.allCancerTypes.result
        .filter(ct => ct.level === -1 && ct.mainType.startsWith('All '))
        .map(ct => ct.mainType)
    );
    return [
      {
        label: 'Cancer Type',
        options: _.uniq(cancerTypesGroup)
          .sort()
          .map(cancerType => {
            return {
              value: cancerType,
              label: cancerType,
            };
          }),
      },
      {
        label: 'Cancer Type Detailed',
        options: _.sortBy(_.uniq(this.allSubtypes), 'name').map(cancerType => {
          return {
            value: cancerType.code,
            label: `${cancerType.subtype} (${cancerType.code})`,
          };
        }),
      },
    ];
  }

  render() {
    if (this.props.isMulti) {
      return (
        <Select
          isMulti
          placeholder="Cancer Type(s)"
          value={this.tumorTypeSelectValue}
          options={this.allTumorTypesOptions}
          formatGroupLabel={data => <span>{data.label}</span>}
          isClearable={true}
          onChange={this.props.onChange}
        />
      );
    }
    return (
      <Select
        value={this.tumorTypeSelectValue[0]}
        placeholder="Select a cancer type"
        options={this.allTumorTypesOptions}
        formatGroupLabel={data => <span>{data.label}</span>}
        isClearable={true}
        {...this.props}
      />
    );
  }
}
