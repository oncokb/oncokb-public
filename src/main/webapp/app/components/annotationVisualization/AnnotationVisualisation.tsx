/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { COLOR_BLUE } from 'app/config/theme';
import { SearchColumn } from '../oncokbTable/OncoKBTable';
import { computed } from 'mobx';
import { getDefaultColumnDefinition, filterByKeyword } from './config/utils';
import {
  AnnotationImplication,
  TreatmentImplication,
  NotificationImplication,
  Drug,
  APIResponse,
  ColumnOption,
  Treatment,
} from './config/constants';
import Tab from './tabs/Tab';
import Tabs from './tabs/Tabs';
import './styles/index.module.scss';
import TabNumbers from './tabs/TabNumbers';
import {
  defaultAnnotationColumns,
  defaultTreatmentColumns,
  ANNOTATION_TYPE,
  annotationColumns,
  treatmentColumns,
  PatientInfo,
} from './config/constants';
import { compareDates, compareVersions } from './config/utils';
import { GenePageTable } from './tables/GenePageTable';

interface Data {
  mutationData: APIResponse[];
  copyNumberAlterationData: APIResponse[];
  structuralVariantData: APIResponse[];
}

export interface AnnotationVisualisationProps {
  data: Data;
  patientInfo: PatientInfo;
  isPatientInfoVisible?: boolean;
  notifications: NotificationImplication[];
}

interface MetaData {
  lastUpdate: string;
  dataVersion: string;
}

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
      this.props.data.mutationData
    );
  }

  @computed
  get copyNumberAnnotations(): AnnotationImplication[] {
    return this.getAnnotations(
      ANNOTATION_TYPE.COPY_NUMBER_ALTERATION,
      this.props.data.copyNumberAlterationData
    );
  }

  @computed
  get structuralAnnotations(): AnnotationImplication[] {
    return this.getAnnotations(
      ANNOTATION_TYPE.STRUCTURAL_VARIANT,
      this.props.data.structuralVariantData
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
      this.props.data.mutationData
    );
  }

  @computed
  get copyNumberTreatments(): TreatmentImplication[] {
    return this.getTreatments(
      ANNOTATION_TYPE.COPY_NUMBER_ALTERATION,
      this.props.data.copyNumberAlterationData
    );
  }

  @computed
  get structuralTreatments(): TreatmentImplication[] {
    return this.getTreatments(
      ANNOTATION_TYPE.STRUCTURAL_VARIANT,
      this.props.data.structuralVariantData
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
  get lastUpdateAndVersion(): MetaData {
    let latestDate: string | null = null;
    let highestVersion: string | null = null;
    this.allAnnotations.forEach(annotation => {
      if (
        annotation['lastUpdate'] &&
        compareDates(annotation['lastUpdate'], latestDate) > 0
      ) {
        latestDate = annotation['lastUpdate'];
      }

      if (
        annotation['dataVersion'] &&
        compareVersions(annotation['dataVersion'], highestVersion) > 0
      ) {
        highestVersion = annotation['dataVersion'];
      }
    });

    return {
      lastUpdate: latestDate || 'NA',
      dataVersion: highestVersion || 'NA',
    };
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

  componentDidMount(): void {
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
  componentWillUnmount(): void {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize(): void {
    this.setState({ viewportWidth: window.innerWidth });
  }

  handleAnnotationColumnsChange = (selectedOptions: ColumnOption[]): void => {
    this.setState({
      selectedAnnotationColumns: selectedOptions.map(
        (option: ColumnOption) => option.value
      ),
    });
    localStorage.setItem(
      'selectedAnnotationColumns',
      JSON.stringify(
        selectedOptions.map((option: ColumnOption) => option.value)
      )
    );
  };

  handleTreatmentColumnsChange = (selectedOptions: ColumnOption[]): void => {
    this.setState({
      selectedTreatmentColumns: selectedOptions.map(
        (option: ColumnOption) => option.value
      ),
    });
    localStorage.setItem(
      'selectedTreatmentColumns',
      JSON.stringify(
        selectedOptions.map((option: ColumnOption) => option.value)
      )
    );
  };

  treatmentTableColumns(
    alterationType: string
  ): SearchColumn<TreatmentImplication>[] {
    const selectedKeys = this.state.selectedTreatmentColumns;
    const filteredColumns = treatmentColumns.filter(col =>
      selectedKeys.includes(col.key)
    );
    return filteredColumns.map(column => ({
      ...getDefaultColumnDefinition(
        column.key,
        this.state.viewportWidth,
        alterationType
      ),
      onFilter: (data: TreatmentImplication, keyword) =>
        filterByKeyword(
          data[column.prop as keyof TreatmentImplication],
          keyword
        ),
    })) as SearchColumn<TreatmentImplication>[];
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
        filterByKeyword(
          data[column.prop as keyof AnnotationImplication],
          keyword
        ),
    })) as SearchColumn<AnnotationImplication>[];
  }

  getTreatments(
    annotationType: ANNOTATION_TYPE,
    data: APIResponse[]
  ): TreatmentImplication[] {
    const treatmentsMap: Map<string, TreatmentImplication> = new Map();

    for (const key of Object.keys(data)) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const response = data[key];

        if (!response || !response['treatments']) {
          continue;
        }

        response['treatments'].forEach((treatment: Treatment) => {
          if (!treatment || !treatment['drugs']) {
            return;
          }

          const biomarker =
            response['query']['hugoSymbol'] && response['query']['alteration']
              ? `${response['query']['hugoSymbol']} ${response['query']['alteration']}`
              : 'NA';
          const level = treatment['level'] || 'NA';
          const annotation =
            response['geneSummary'] ||
            response['variantSummary'] ||
            response['tumorTypeSummary']
              ? `${response['geneSummary'] || ''} ${
                  response['variantSummary'] || ''
                } ${response['tumorTypeSummary'] || ''}`
              : 'NA';
          const alterationType = annotationType;
          const treatmentFdaLevel = treatment['fdaLevel'] || 'NA';
          const treatmentDescription = treatment['description'] || 'NA';

          const biomarkerKey = `${biomarker}-${level}`;

          const drugNames = treatment['drugs']
            .map((drug: Drug) => drug['drugName'])
            .filter(Boolean);

          if (treatmentsMap.has(biomarkerKey)) {
            const existingEntry = treatmentsMap.get(biomarkerKey);
            if (existingEntry) {
              const existingDrugs = new Set(existingEntry.drug.split(', '));
              drugNames.forEach((drug: string) => existingDrugs.add(drug));
              existingEntry.drug = Array.from(existingDrugs).join(', ');
            }
          } else {
            treatmentsMap.set(biomarkerKey, {
              biomarker,
              drug: Array.from(new Set(drugNames)).join(', '),
              level,
              annotation,
              alterationType,
              treatmentFdaLevel,
              treatmentDescription,
            });
          }
        });
      }
    }

    return Array.from(treatmentsMap.values());
  }

  getAnnotations(
    annotationType: ANNOTATION_TYPE,
    data: APIResponse[]
  ): AnnotationImplication[] {
    const listData: APIResponse[] = [];

    for (const key of Object.keys(data)) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const response = data[key];
        listData.push(response);
      }
    }

    const annotations = listData.map((response: APIResponse) => {
      return {
        level: response['highestSensitiveLevel'] || 'NA',
        gene: response['query']['hugoSymbol'] || 'NA',
        mutation: response['query']['alteration'] || 'NA',
        consequenceType: response['query']['consequence'] || 'NA',
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
        lastUpdate: response['lastUpdate'],
        dataVersion: response['dataVersion'],
      };
    });

    return annotations;
  }

  getAPIResponsesList(): APIResponse[] {
    return [
      ...this.props.data.mutationData,
      ...this.props.data.copyNumberAlterationData,
      ...this.props.data.structuralVariantData,
    ];
  }

  render() {
    return (
      <>
        {this.props.isPatientInfoVisible && (
          <div className="flex flex-row">
            <div>
              <h2 className="mb-1" style={{ color: COLOR_BLUE }}>
                {this.props.patientInfo.patientId}
              </h2>
            </div>
            <div className="flex flex-col">
              <h6>
                {this.props.patientInfo.age +
                  ' years, ' +
                  this.props.patientInfo.gender}
              </h6>
            </div>
          </div>
        )}
        <Tabs
          defaultActiveKey="mutations"
          id="uncontrolled-tab-example"
          dataVersion={this.lastUpdateAndVersion['dataVersion']}
          lastUpdate={this.lastUpdateAndVersion['lastUpdate']}
          notifications={this.props.notifications}
          patientInfo={this.props.patientInfo}
          responseList={this.getAPIResponsesList()}
        >
          <Tab
            eventKey="all"
            title={
              <TabNumbers number={this.allAnnotations.length} title="All" />
            }
          >
            <div>
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
