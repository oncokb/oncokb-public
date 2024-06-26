import * as React from 'react';
import { COLOR_BLUE } from './config/theme';
import { GenePageTable } from './components/tables/GenePageTable';
import { SearchColumn } from './components/tables/OncoKBTable';
import { computed } from 'mobx';
import {
  getDefaultColumnDefinition,
  filterByKeyword,
} from './components/Utils';
import {
  AnnotationImplication,
  TreatmentImplication,
  NotificationImplication,
} from './config/constants';
import Tab from './components/tabs/Tab';
import Tabs from './components/tabs/Tabs';
import Notification from './components/notifications/notifications';
import './components/styles/index.module.scss';
import TabNumbers from './components/tabs/TabNumbers';
import {
  defaultAnnotationColumns,
  defaultTreatmentColumns,
} from './config/constants';
import { TREATMENTS_TABLE_COLUMN_KEY } from './config/constants';
export interface AnnotationVisualisationProps {
  data: any;
  patientId: string;
  patientInfo: string;
  isPatientInfoVisible?: boolean;
  notifications: NotificationImplication[];
}
import { annotationColumns, treatmentColumns } from './config/constants';
import { ANNOTATION_TYPE } from './config/constants';

export interface AnnotationVisualisationState {
  selectedAnnotationColumns: string[];
  selectedTreatmentColumns: string[];
  viewportWidth: number;
}
export class AnnotationVisualisation extends React.Component<
  AnnotationVisualisationProps,
  AnnotationVisualisationState
> {
  @computed
  get mutationsAnnotations(): AnnotationImplication[] {
    return this.getAnnotations(
      ANNOTATION_TYPE.MUTATION,
      this.props.data['mutationData']
    );
  }

  @computed
  get copyNumberAnnotations(): AnnotationImplication[] {
    return this.getAnnotations(
      ANNOTATION_TYPE.COPY_NUMBER_ALTERATION,
      this.props.data['cnaData']
    );
  }

  @computed
  get structuralAnnotations(): AnnotationImplication[] {
    return this.getAnnotations(
      ANNOTATION_TYPE.STRUCTURAL_VARIANT,
      this.props.data['structuralVariant']
    );
  }

  @computed
  get allAnnotations(): AnnotationImplication[] {
    const annotations = [
      ...this.mutationsAnnotations,
      ...this.copyNumberAnnotations,
      ...this.structuralAnnotations,
    ];
    return annotations;
  }

  @computed
  get mutationsTreatments(): TreatmentImplication[] {
    return this.getTreatments(
      ANNOTATION_TYPE.MUTATION,
      this.props.data['mutationData']
    );
  }

  @computed
  get copyNumberTreatments(): TreatmentImplication[] {
    return this.getTreatments(
      ANNOTATION_TYPE.COPY_NUMBER_ALTERATION,
      this.props.data['cnaData']
    );
  }

  @computed
  get structuralTreatments(): TreatmentImplication[] {
    return this.getTreatments(
      ANNOTATION_TYPE.STRUCTURAL_VARIANT,
      this.props.data['structualVariantData']
    );
  }

  @computed
  get allTreatments(): TreatmentImplication[] {
    return [
      ...this.mutationsTreatments,
      ...this.copyNumberTreatments,
      ...this.structuralTreatments,
    ];
  }

  @computed
  get mutationsNotifications(): NotificationImplication[] {
    return this.props.notifications.filter(
      notification => notification.alterationType === ANNOTATION_TYPE.MUTATION
    );
  }

  @computed
  get copyNumberNotifications(): NotificationImplication[] {
    return this.props.notifications.filter(
      notification =>
        notification.alterationType === ANNOTATION_TYPE.COPY_NUMBER_ALTERATION
    );
  }

  @computed
  get structuralNotifications(): NotificationImplication[] {
    return this.props.notifications.filter(
      notification =>
        notification.alterationType === ANNOTATION_TYPE.STRUCTURAL_VARIANT
    );
  }

  constructor(props: AnnotationVisualisationProps) {
    super(props);
    this.state = {
      selectedAnnotationColumns: defaultAnnotationColumns,
      selectedTreatmentColumns: defaultTreatmentColumns,
      viewportWidth: window.innerWidth,
    };
    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    const savedAnnotationColumns = localStorage.getItem(
      'selectedAnnotationColumns'
    );
    const savedTreatmentColumns = localStorage.getItem(
      'selectedTreatmentColumns'
    );

    if (savedAnnotationColumns === null) {
      this.setState({
        selectedAnnotationColumns: defaultAnnotationColumns,
      });
    } else {
      this.setState({
        selectedAnnotationColumns: JSON.parse(savedAnnotationColumns),
      });
    }

    if (savedTreatmentColumns === null) {
      this.setState({
        selectedTreatmentColumns: defaultTreatmentColumns,
      });
    } else {
      this.setState({
        selectedTreatmentColumns: JSON.parse(savedTreatmentColumns),
      });
    }
    window.addEventListener('resize', this.handleResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.setState({ viewportWidth: window.innerWidth });
  }

  handleAnnotationColumnsChange = (selectedOptions: any) => {
    this.setState({
      selectedAnnotationColumns: selectedOptions.map((option: any) =>
        option.value ? option.value : option.prop
      ),
    });
    localStorage.setItem(
      'selectedAnnotationColumns',
      JSON.stringify(selectedOptions.map((option: any) => option.value))
    );
  };

  handleTreatmentColumnsChange = (selectedOptions: any) => {
    this.setState({
      selectedTreatmentColumns: selectedOptions.map(
        (option: any) => option.value
      ),
    });
    localStorage.setItem(
      'selectedTreatmentColumns',
      JSON.stringify(selectedOptions.map((option: any) => option.value))
    );
  };

  treatmentTableColumns(
    alterationType: string
  ): SearchColumn<TreatmentImplication>[] {
    const selectedKeys = this.state.selectedTreatmentColumns;
    const filteredColumns = treatmentColumns.filter(col =>
      selectedKeys.includes(col.key)
    );
    const hasAnnotation = selectedKeys.some(
      column => column === TREATMENTS_TABLE_COLUMN_KEY.ANNOTATION
    );
    return filteredColumns.map(column => ({
      ...getDefaultColumnDefinition(
        column.key,
        this.state.viewportWidth,
        alterationType
      ),
      onFilter: (data: TreatmentImplication, keyword) =>
        filterByKeyword(data[column.prop], keyword),
    }));
  }

  annotationTableColumns(
    alterationType: string
  ): SearchColumn<AnnotationImplication>[] {
    const selectedKeys = this.state.selectedAnnotationColumns;
    const filteredColumns = annotationColumns.filter(col =>
      selectedKeys.includes(col.key)
    );

    return filteredColumns.map(column => ({
      ...getDefaultColumnDefinition(
        column.key,
        this.state.viewportWidth,
        alterationType
      ),
      onFilter: (data: AnnotationImplication, keyword) =>
        filterByKeyword(data[column.prop], keyword),
    }));
  }

  getTreatments(
    annotationType: ANNOTATION_TYPE,
    data: any
  ): TreatmentImplication[] {
    let treatments: TreatmentImplication[] = [];

    // Iterate over each entry in data
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        const response = data[key];

        if (!response || !response['treatments']) {
          continue;
        }

        const uniqueEntries = new Set();

        const treatmentEntries = response['treatments'].reduce(
          (acc, treatment) => {
            if (!treatment || !treatment['drugs']) {
              return acc;
            }

            const drugs = treatment['drugs']
              .map(drug => {
                if (!drug || !drug['drugName']) {
                  return null;
                }

                const biomarker =
                  response['query']['hugoSymbol'] &&
                  response['query']['alteration']
                    ? `${response['query']['hugoSymbol']} ${response['query']['alteration']}`
                    : 'NA';
                const drugName = drug['drugName'] || 'NA';

                const biomarkerDrugPair = `${biomarker}-${drugName}`;

                if (uniqueEntries.has(biomarkerDrugPair)) {
                  return null;
                }

                uniqueEntries.add(biomarkerDrugPair);

                return {
                  biomarker: biomarker,
                  drug: drugName,
                  level: treatment['level'] || 'NA',
                  annotation:
                    response['geneSummary'] ||
                    response['variantSummary'] ||
                    response['tumorTypeSummary']
                      ? `${response['geneSummary'] || ''} ${
                          response['variantSummary'] || ''
                        } ${response['tumorTypeSummary'] || ''}`
                      : 'NA',
                  alterationType: annotationType,
                  treatmentFdaLevel: treatment['fdaLevel'] || 'NA',
                  treatmentDescription: treatment['description'] || 'NA',
                };
              })
              .filter(Boolean);

            return acc.concat(drugs);
          },
          []
        );

        treatments = treatments.concat(treatmentEntries);
      }
    }

    return treatments;
  }

  getAnnotations(
    annotationType: ANNOTATION_TYPE,
    data: any
  ): AnnotationImplication[] {
    let listData = [];
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        listData.push(data[key]);
      }
    }
    const annotations = listData.map((response: any) => {
      return {
        level: response['highestSensitiveLevel'] || 'NA',
        gene: response['query']['hugoSymbol'] || 'NA',
        mutation: response['query']['alteration'] || 'NA',
        consequenceType: response['query']['consequence'] || 'NA',
        drug:
          response['treatments'] &&
          response['treatments'].length > 0 &&
          response['treatments'][0]['drugs'] &&
          response['treatments'][0]['drugs'].length > 0
            ? response['treatments'][0]['drugs'][0]['drugName']
            : 'NA',
        location: response['query']['proteinStart']
          ? response['query']['proteinStart'] +
            (response['query']['proteinEnd']
              ? ',' + response['query']['proteinEnd']
              : '')
          : 'NA',
        oncogenicity: response['oncogenic'],
        biologicalEffect: response['mutationEffect']['knownEffect'] || 'NA',
        alterationType: annotationType,
        mutationDescription: response['mutationEffect']['description'] || 'NA',
        tumorType: response['query']['tumorType'] || 'NA',
        fdaLevel: response['highestFdaLevel'] || 'NA',
      };
    });
    return annotations;
  }
  render() {
    return (
      <>
        {this.props.isPatientInfoVisible && (
          <div className="flex flex-row">
            <div>
              <h2 className="mb-1" style={{ color: COLOR_BLUE }}>
                {this.props.patientId}
              </h2>
            </div>
            <div className="flex flex-col">
              <h6>{this.props.patientInfo}</h6>
            </div>
          </div>
        )}
        <Tabs defaultActiveKey="mutations" id="uncontrolled-tab-example">
          <Tab
            eventKey="all"
            title={
              <TabNumbers number={this.allAnnotations.length} title="All" />
            }
          >
            <div>
              <Notification notifications={this.props.notifications} />
              <div>
                <GenePageTable
                  name={'All Alterations in the sample'}
                  data={this.allAnnotations}
                  columns={this.annotationTableColumns('Alteration')}
                  isPending={false}
                  selectedAnnotationColumns={
                    this.state.selectedAnnotationColumns
                  }
                  selectedColumns={annotationColumns}
                  handleColumnsChange={this.handleAnnotationColumnsChange}
                />
              </div>
              <div>
                <GenePageTable
                  name={'Treatments for the Biomarker'}
                  data={this.allTreatments}
                  columns={this.treatmentTableColumns('Alteration')}
                  isPending={false}
                  selectedColumns={treatmentColumns}
                  selectedAnnotationColumns={
                    this.state.selectedTreatmentColumns
                  }
                  handleColumnsChange={this.handleTreatmentColumnsChange}
                />
              </div>
            </div>
          </Tab>
          <Tab
            eventKey="mutations"
            title={
              <TabNumbers
                number={this.mutationsAnnotations.length}
                title="Mutations"
              />
            }
          >
            <div>
              <Notification notifications={this.mutationsNotifications} />
              <div>
                <GenePageTable
                  name={'Mutations in the sample'}
                  data={this.mutationsAnnotations}
                  columns={this.annotationTableColumns('Mutation')}
                  isPending={false}
                  selectedAnnotationColumns={
                    this.state.selectedAnnotationColumns
                  }
                  selectedColumns={annotationColumns}
                  handleColumnsChange={this.handleAnnotationColumnsChange}
                />
              </div>
              <div>
                <GenePageTable
                  name={'Treatments for the Biomarker'}
                  data={this.mutationsTreatments}
                  columns={this.treatmentTableColumns('Mutation')}
                  isPending={false}
                  selectedColumns={treatmentColumns}
                  selectedAnnotationColumns={
                    this.state.selectedTreatmentColumns
                  }
                  handleColumnsChange={this.handleTreatmentColumnsChange}
                />
              </div>
            </div>
          </Tab>
          <Tab
            eventKey="copyNumberAlterations"
            title={
              <TabNumbers
                number={this.copyNumberAnnotations.length}
                title="Copy Number Alterations"
              />
            }
          >
            <div>
              <Notification notifications={this.copyNumberNotifications} />
              <div>
                <GenePageTable
                  name={'Copy Number Alterations in the sample'}
                  data={this.copyNumberAnnotations}
                  columns={this.annotationTableColumns(
                    'Copy Number Alteration'
                  )}
                  isPending={false}
                  selectedAnnotationColumns={
                    this.state.selectedAnnotationColumns
                  }
                  selectedColumns={annotationColumns}
                  handleColumnsChange={this.handleAnnotationColumnsChange}
                />
              </div>
              <div>
                <GenePageTable
                  name={'Treatments for the Biomarker'}
                  data={this.copyNumberTreatments}
                  columns={this.treatmentTableColumns('Copy Number Alteration')}
                  isPending={false}
                  selectedColumns={treatmentColumns}
                  selectedAnnotationColumns={
                    this.state.selectedTreatmentColumns
                  }
                  handleColumnsChange={this.handleTreatmentColumnsChange}
                />
              </div>
            </div>
          </Tab>
          <Tab
            eventKey="structuralVariants"
            title={
              <TabNumbers
                number={this.structuralAnnotations.length}
                title="Structural Variants"
              />
            }
          >
            <div>
              <Notification notifications={this.structuralNotifications} />
              <div>
                <GenePageTable
                  name={'Structural Variants in the sample'}
                  data={this.structuralAnnotations}
                  columns={this.annotationTableColumns('Structural Variant')}
                  isPending={false}
                  selectedAnnotationColumns={
                    this.state.selectedAnnotationColumns
                  }
                  selectedColumns={annotationColumns}
                  handleColumnsChange={this.handleAnnotationColumnsChange}
                />
              </div>
              <div>
                <GenePageTable
                  name={'Treatments for the Biomarker'}
                  data={this.structuralTreatments}
                  columns={this.treatmentTableColumns('Structural Variant')}
                  isPending={false}
                  selectedColumns={treatmentColumns}
                  selectedAnnotationColumns={
                    this.state.selectedTreatmentColumns
                  }
                  handleColumnsChange={this.handleTreatmentColumnsChange}
                />
              </div>
            </div>
          </Tab>
        </Tabs>
      </>
    );
  }
}
