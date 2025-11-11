import React from 'react';
import { observer } from 'mobx-react';
import Select, { Props as SelectProps } from 'react-select';
import { computed } from 'mobx';
import { TumorType } from 'app/shared/api/generated/OncoKbPrivateAPI';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { remoteData } from 'cbioportal-frontend-commons';
import { uniq } from 'app/shared/utils/LodashUtils';

interface ICancerTypeSelect extends SelectProps {
  cancerTypes?: string[];
  prioritizedCancerTypes?: string[];
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
        const matchedSubtype = this.allSubtypes.find(
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
    return uniq(
      this.allCancerTypes.result
        .filter(cancerType => cancerType.level >= 0)
        .map(cancerType => cancerType.mainType)
    ).sort();
  }

  @computed
  get allSubtypes() {
    return uniq(
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

    const allTumorTypesOptions = [];
    if (this.props.prioritizedCancerTypes) {
      allTumorTypesOptions.push({
        label: 'Cancer Types with Evidence',
        options: this.props.prioritizedCancerTypes.map(cancerType => {
          return {
            value: cancerType,
            label: cancerType,
          };
        }),
      });
    }
    allTumorTypesOptions.push({
      label: 'Cancer Type',
      options: uniq(cancerTypesGroup)
        .filter(ct => !this.props.prioritizedCancerTypes?.includes(ct))
        .sort()
        .map(cancerType => {
          return {
            value: cancerType,
            label: cancerType,
          };
        }),
    });
    allTumorTypesOptions.push({
      label: 'Cancer Type Detailed',
      options: this.allSubtypes
        .sort((ct1, ct2) => ct1.subtype.localeCompare(ct2.subtype))
        .filter(ct => !this.props.prioritizedCancerTypes?.includes(ct.subtype))
        .map(cancerType => {
          return {
            value: cancerType.code,
            label: `${cancerType.subtype} (${cancerType.code})`,
          };
        }),
    });

    return allTumorTypesOptions;
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
