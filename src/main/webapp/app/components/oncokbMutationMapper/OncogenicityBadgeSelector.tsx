import autobind from "autobind-decorator";
import {Option} from "cbioportal-frontend-commons";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from 'react';
import {BadgeSelector, BadgeSelectorProps} from "react-mutation-mapper";
import styles from "app/components/oncokbMutationMapper/oncokbMutationMapper.module.scss";


export type OncogenicityBadgeSelectorProps = BadgeSelectorProps &
{
  oncogenicities: {oncogenicity: string}[];
  counts: {[oncogenicity: string]: number};
};

@observer
export class OncogenicityBadgeSelector extends React.Component<OncogenicityBadgeSelectorProps, {}>
{
  public static defaultProps: Partial<OncogenicityBadgeSelectorProps> = {
    numberOfColumnsPerRow: 1
  };

  @computed
  protected get options()
  {
    return this.props.oncogenicities.map(o => ({value: o.oncogenicity}));
  }

  public render() {
    return (
      <BadgeSelector
        options={this.options}
        getOptionLabel={this.getOncogenicityOptionLabel}
        {...this.props}
      />
    );
  }

  @autobind
  protected getOncogenicityOptionLabel(option: Option,
                                       selectedValues: {[optionValue: string]: any}): JSX.Element
  {
    const isSelected = option.value in selectedValues;

    return (
      <div className="mb-2" key={option.value}>
          <span
            className={isSelected ? styles.activeBadge : styles.badge}
          >
            {this.props.counts[option.value]}
          </span>
        <span>{option.value}</span>
      </div>
    );
  }
}

export default OncogenicityBadgeSelector;
