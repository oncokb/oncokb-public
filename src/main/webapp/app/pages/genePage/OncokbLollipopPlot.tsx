import {
  ONCOGENICITY_FILTER_ID,
  ONCOGENICITY_FILTER_TYPE,
} from 'app/components/oncokbMutationMapper/FilterUtils';
import OncogenicityCheckboxes from 'app/components/oncokbMutationMapper/OncogenicityCheckboxes';
import { OncokbMutationMapper } from 'app/components/oncokbMutationMapper/OncokbMutationMapper';
import { GRID_BREAKPOINTS } from 'app/config/constants';
import { AnnotationStore } from 'app/store/AnnotationStore';
import WindowStore, { IWindowSize } from 'app/store/WindowStore';
import _ from 'lodash';
import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { If } from 'react-if';
import { onFilterOptionSelect } from 'react-mutation-mapper';

type LollipopPlotProps = {
  store: AnnotationStore;
  windowStore: WindowStore;
  showPlotControlsOnHover?: boolean;
};

@observer
export default class OncokbLollipopPlot extends React.Component<
  LollipopPlotProps,
  {}
> {
  @observable hidePlotControls = false;

  @computed
  get windowWrapper() {
    const mapperMaxWidth =
      this.props.windowStore.size.width > GRID_BREAKPOINTS.XL
        ? GRID_BREAKPOINTS.XL
        : this.props.windowStore.size.width;

    const windowSize: IWindowSize = {
      width: this.props.windowStore.isMDScreen
        ? mapperMaxWidth - (this.props.store.barChartData.length > 0 ? 300 : 0)
        : this.props.windowStore.size.width,
      height: this.props.windowStore.size.height,
    };
    return { size: windowSize };
  }

  render() {
    return (
      <div>
        <OncokbMutationMapper
          {...this.props.store.mutationMapperProps.result}
          store={this.props.store.mutationMapperStore.result}
          oncogenicities={this.props.store.uniqOncogenicity}
          showTrackSelector={false}
          showPlotLegendToggle={true}
          showPlotYMaxSlider={true}
          showPlotDownloadControls={true}
          windowWrapper={this.windowWrapper}
        />
        <If condition={!this.hidePlotControls}>
          <OncogenicityCheckboxes
            oncogenicities={this.props.store.calculateOncogenicities(
              this.props.store.filteredBiologicalAlterations
            )}
            selectedOncogenicities={
              this.props.store.mutationMapperStore.result?.dataStore.dataFilters.find(
                f => f.id === ONCOGENICITY_FILTER_ID
              )?.values as string[]
            }
            onToggle={oncogenicity => {
              this.props.store.mutationMapperStore &&
              this.props.store.mutationMapperStore.result
                ? onFilterOptionSelect(
                    _.xor(
                      this.props.store.mutationMapperStore.result?.dataStore.dataFilters.find(
                        f => f.id === ONCOGENICITY_FILTER_ID
                      )?.values,
                      [oncogenicity]
                    ),
                    false,
                    this.props.store.mutationMapperStore.result.dataStore,
                    ONCOGENICITY_FILTER_TYPE,
                    ONCOGENICITY_FILTER_ID
                  )
                : undefined;
            }}
          />
        </If>
      </div>
    );
  }
}
