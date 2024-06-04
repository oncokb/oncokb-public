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

export class AnnotationVisualisation extends React.Component<
  AnnotationVisualisationProps
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

  @computed
  get treatmentTableColumns(): SearchColumn<TreatmentImplication>[] {
    const treatmentColumns = [
      { key: MUTATIONS_TABLE_COLUMN_KEY.BIOMARKER, prop: 'biomarker' },
      { key: MUTATIONS_TABLE_COLUMN_KEY.DRUG, prop: 'drug' },
      { key: MUTATIONS_TABLE_COLUMN_KEY.LEVEL, prop: 'level' },
      { key: MUTATIONS_TABLE_COLUMN_KEY.ANNOTATION, prop: 'annotation' },
    ];

    const treatmentTableColumns: SearchColumn<TreatmentImplication>[] = [];

    treatmentColumns.forEach(column => {
      treatmentTableColumns.push({
        ...getDefaultColumnDefinition(column.key),
        onFilter: (data: TreatmentImplication, keyword) =>
          filterByKeyword(data[column.prop], keyword),
      });
    });

    return treatmentTableColumns;
  }

  @computed
  get annotationTableColumns(): SearchColumn<AnnotationImplication>[] {
    const annotationColumns = [
      { key: MUTATIONS_TABLE_COLUMN_KEY.GENE, prop: 'gene' },
      { key: MUTATIONS_TABLE_COLUMN_KEY.MUTATION, prop: 'mutation' },
      {
        key: MUTATIONS_TABLE_COLUMN_KEY.CONSEQUENCE_TYPE,
        prop: 'consequenceType',
      },
      { key: MUTATIONS_TABLE_COLUMN_KEY.DRUG, prop: 'drug' },
      { key: MUTATIONS_TABLE_COLUMN_KEY.LOCATION, prop: 'location' },
      { key: MUTATIONS_TABLE_COLUMN_KEY.ONCOGENICITY, prop: 'oncogenicity' },
      {
        key: MUTATIONS_TABLE_COLUMN_KEY.BIOLOGICAL_EFFECT,
        prop: 'biologicalEffect',
      },
      { key: MUTATIONS_TABLE_COLUMN_KEY.LEVEL, prop: 'level' },
    ];

    const annotationTableColumns: SearchColumn<AnnotationImplication>[] = [];

    annotationColumns.forEach(column => {
      annotationTableColumns.push({
        ...getDefaultColumnDefinition(column.key),
        onFilter: (data: AnnotationImplication, keyword) =>
          filterByKeyword(data[column.prop], keyword),
      });
    });

    return annotationTableColumns;
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
          className="my-3"
        >
          <Tab eventKey="mutations" title="Mutations">
            <div>
              <Notification notifications={this.mutationsNotifications} />
              <div className="mt-4">
                <GenePageTable
                  name={'Mutations in the sample'}
                  data={this.mutationsAnnotations}
                  columns={this.annotationTableColumns}
                  isPending={false}
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
              <div className="mt-4">
                <GenePageTable
                  name={'Mutations in the sample'}
                  data={this.copyNumberAnnotations}
                  columns={this.annotationTableColumns}
                  isPending={false}
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
              <div className="mt-4">
                <GenePageTable
                  name={'Mutations in the sample'}
                  data={this.structuralAnnotations}
                  columns={this.annotationTableColumns}
                  isPending={false}
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
