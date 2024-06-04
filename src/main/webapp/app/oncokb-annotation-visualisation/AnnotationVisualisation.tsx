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
  MUTATIONS_TABLE_COLUMN_KEY,
  TREATMENTS_TABLE_COLUMN_KEY,
} from './config/constants';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Notification from './components/notifications/notifications';
export interface AnnotationVisualisationProps {
  annotations: AnnotationImplication[];
  treatments: TreatmentImplication[];
  patientId: string;
  patientInfo: string;
  isPatientInfoVisible?: boolean;
  notifications: NotificationImplication[];
}
import Select from 'react-select';

export interface AnnotationVisualisationState {
  selectedAnnotationColumns: string[];
  selectedTreatmentColumns: string[];
}

const annotationColumns = [
  { key: MUTATIONS_TABLE_COLUMN_KEY.GENE, label: 'Gene', prop: 'gene' },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.MUTATION,
    label: 'Mutation',
    prop: 'mutation',
  },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.CONSEQUENCE_TYPE,
    label: 'Consequence Type',
    prop: 'consequenceType',
  },
  { key: MUTATIONS_TABLE_COLUMN_KEY.DRUG, label: 'Drug', prop: 'drug' },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.LOCATION,
    label: 'Location',
    prop: 'location',
  },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.ONCOGENICITY,
    label: 'Oncogenicity',
    prop: 'oncogenicity',
  },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.BIOLOGICAL_EFFECT,
    label: 'Biological Effect',
    prop: 'biologicalEffect',
  },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.MUTATION_DESCRIPTION,
    label: 'Mutation Description',
    prop: 'mutationDescription',
  },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.ENTREZ_GENE_ID,
    label: 'Entrez Gene ID',
    prop: 'entrezGeneId',
  },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.TUMOR_TYPE,
    label: 'Tumor Type',
    prop: 'tumorType',
  },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.FDA_LEVEL,
    label: 'FDA Level',
    prop: 'fdaLevel',
  },
  {
    key: MUTATIONS_TABLE_COLUMN_KEY.LAST_UPDATE,
    label: 'Last Update',
    prop: 'lastUpdate',
  },
];

const treatmentColumns = [
  {
    key: TREATMENTS_TABLE_COLUMN_KEY.BIOMARKER,
    label: 'Biomarker',
    prop: 'biomarker',
  },
  { key: TREATMENTS_TABLE_COLUMN_KEY.DRUG, label: 'Drug', prop: 'drug' },
  { key: TREATMENTS_TABLE_COLUMN_KEY.LEVEL, label: 'Level', prop: 'level' },
  {
    key: TREATMENTS_TABLE_COLUMN_KEY.ANNOTATION,
    label: 'Annotation',
    prop: 'annotation',
  },
  {
    key: TREATMENTS_TABLE_COLUMN_KEY.TREATMENT_FDA_LEVEL,
    label: 'Treatment FDA Level',
    prop: 'treatmentFdaLevel',
  },
  {
    key: TREATMENTS_TABLE_COLUMN_KEY.TREATMENT_DESCRIPTION,
    label: 'Treatment Description',
    prop: 'treatmentDescription',
  },
];

export class AnnotationVisualisation extends React.Component<
  AnnotationVisualisationProps,
  AnnotationVisualisationState
> {
  @computed
  get mutationsAnnotations(): AnnotationImplication[] {
    return this.props.annotations.filter(
      annotation => annotation.alterationType === 'MUTATION'
    );
  }

  @computed
  get copyNumberAnnotations(): AnnotationImplication[] {
    return this.props.annotations.filter(
      annotation => annotation.alterationType === 'COPY_NUMBER_ALTERATION'
    );
  }

  @computed
  get structuralAnnotations(): AnnotationImplication[] {
    return this.props.annotations.filter(
      annotation => annotation.alterationType === 'STRUCTURAL_VARIANT'
    );
  }

  @computed
  get mutationsTreatments(): TreatmentImplication[] {
    return this.props.treatments.filter(
      treatment => treatment.alterationType === 'MUTATION'
    );
  }

  @computed
  get copyNumberTreatments(): TreatmentImplication[] {
    return this.props.treatments.filter(
      treatment => treatment.alterationType === 'COPY_NUMBER_ALTERATION'
    );
  }

  @computed
  get structuralTreatments(): TreatmentImplication[] {
    return this.props.treatments.filter(
      treatment => treatment.alterationType === 'STRUCTURAL_VARIANT'
    );
  }

  @computed
  get mutationsNotifications(): NotificationImplication[] {
    return this.props.notifications.filter(
      notification => notification.alterationType === 'MUTATION'
    );
  }

  @computed
  get copyNumberNotifications(): NotificationImplication[] {
    return this.props.notifications.filter(
      notification => notification.alterationType === 'COPY_NUMBER_ALTERATION'
    );
  }

  @computed
  get structuralNotifications(): NotificationImplication[] {
    return this.props.notifications.filter(
      notification => notification.alterationType === 'STRUCTURAL_VARIANT'
    );
  }

  constructor(props: AnnotationVisualisationProps) {
    super(props);
    this.state = {
      selectedAnnotationColumns: annotationColumns.map(col => col.key),
      selectedTreatmentColumns: treatmentColumns.map(col => col.key),
    };
  }

  componentDidMount() {
    const savedAnnotationColumns = localStorage.getItem(
      'selectedAnnotationColumns'
    );
    const savedTreatmentColumns = localStorage.getItem(
      'selectedTreatmentColumns'
    );

    if (savedAnnotationColumns && savedTreatmentColumns) {
      this.setState({
        selectedAnnotationColumns: JSON.parse(savedAnnotationColumns),
        selectedTreatmentColumns: JSON.parse(savedTreatmentColumns),
      });
    }
  }

  handleAnnotationColumnsChange = (selectedOptions: any) => {
    this.setState({
      selectedAnnotationColumns: selectedOptions.map(
        (option: any) => option.value
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

  @computed
  get treatmentTableColumns(): SearchColumn<TreatmentImplication>[] {
    const selectedKeys = this.state.selectedTreatmentColumns;
    const filteredColumns = treatmentColumns.filter(col =>
      selectedKeys.includes(col.key)
    );

    return filteredColumns.map(column => ({
      ...getDefaultColumnDefinition(column.key),
      onFilter: (data: TreatmentImplication, keyword) =>
        filterByKeyword(data[column.prop], keyword),
    }));
  }

  @computed
  get annotationTableColumns(): SearchColumn<AnnotationImplication>[] {
    const selectedKeys = this.state.selectedAnnotationColumns;
    const filteredColumns = annotationColumns.filter(col =>
      selectedKeys.includes(col.key)
    );

    return filteredColumns.map(column => ({
      ...getDefaultColumnDefinition(column.key),
      onFilter: (data: AnnotationImplication, keyword) =>
        filterByKeyword(data[column.prop], keyword),
    }));
  }

  filterAnnotationsByType(alterationType: string): AnnotationImplication[] {
    return this.props.annotations.filter(
      annotation => annotation.alterationType === alterationType
    );
  }

  filterTreatmentsByType(alterationType: string): TreatmentImplication[] {
    return this.props.treatments.filter(
      treatment => treatment.alterationType === alterationType
    );
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
        <Tabs
          defaultActiveKey="mutations"
          id="uncontrolled-tab-example"
          className="my-3 text-xl"
        >
          <Tab eventKey="mutations" title="Mutations">
            <div>
              <Notification notifications={this.mutationsNotifications} />
              <div className="mt-3">
                <Select
                  isMulti
                  options={annotationColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  value={this.state.selectedAnnotationColumns.map(col => ({
                    value: col,
                    label: annotationColumns.find(c => c.key === col)?.label,
                  }))}
                  onChange={this.handleAnnotationColumnsChange}
                />
              </div>
              <div className="mt-4">
                <GenePageTable
                  name={'Mutations in the sample'}
                  data={this.mutationsAnnotations}
                  columns={this.annotationTableColumns}
                  isPending={false}
                />
              </div>
              <div className="mt-3">
                <Select
                  isMulti
                  options={treatmentColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  value={this.state.selectedTreatmentColumns.map(col => ({
                    value: col,
                    label: treatmentColumns.find(c => c.key === col)?.label,
                  }))}
                  onChange={this.handleTreatmentColumnsChange}
                  className="mt-2"
                />
              </div>
              <div className="mt-4">
                <GenePageTable
                  name={'Treatments for the Biomarker'}
                  data={this.mutationsTreatments}
                  columns={this.treatmentTableColumns}
                  isPending={false}
                />
              </div>
            </div>
          </Tab>
          <Tab eventKey="copyNumberAlterations" title="Copy Number Alterations">
            <div>
              <Notification notifications={this.copyNumberNotifications} />
              <div className="mt-3">
                <Select
                  isMulti
                  options={annotationColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  defaultValue={annotationColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  onChange={this.handleAnnotationColumnsChange}
                />
              </div>
              <div className="mt-4">
                <GenePageTable
                  name={'Mutations in the sample'}
                  data={this.copyNumberAnnotations}
                  columns={this.annotationTableColumns}
                  isPending={false}
                />
              </div>
              <div className="mt-3">
                <Select
                  isMulti
                  options={treatmentColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  defaultValue={treatmentColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  onChange={this.handleTreatmentColumnsChange}
                  className="mt-2"
                />
              </div>
              <div className="mt-4">
                <GenePageTable
                  name={'Treatments for the Biomarker'}
                  data={this.copyNumberTreatments}
                  columns={this.treatmentTableColumns}
                  isPending={false}
                />
              </div>
            </div>
          </Tab>
          <Tab eventKey="structuralVariants" title="Structural Variants">
            <div>
              <Notification notifications={this.structuralNotifications} />
              <div className="mt-3">
                <Select
                  isMulti
                  options={annotationColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  defaultValue={annotationColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  onChange={this.handleAnnotationColumnsChange}
                />
              </div>
              <div className="mt-4">
                <GenePageTable
                  name={'Mutations in the sample'}
                  data={this.structuralAnnotations}
                  columns={this.annotationTableColumns}
                  isPending={false}
                />
              </div>
              <div className="mt-3">
                <Select
                  isMulti
                  options={treatmentColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  defaultValue={treatmentColumns.map(col => ({
                    value: col.key,
                    label: col.label,
                  }))}
                  onChange={this.handleTreatmentColumnsChange}
                  className="mt-2"
                />
              </div>
              <div className="mt-4">
                <GenePageTable
                  name={'Treatments for the Biomarker'}
                  data={this.structuralTreatments}
                  columns={this.treatmentTableColumns}
                  isPending={false}
                />
              </div>
            </div>
          </Tab>
        </Tabs>
      </>
    );
  }
}
