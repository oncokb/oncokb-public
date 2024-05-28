import * as React from 'react';
import { COLOR_BLUE } from './config/theme';
import { GenePageTable } from './components/GenePageTable';
import { SearchColumn } from './components/OncoKBTable';
import { computed } from 'mobx';
import {
  getDefaultColumnDefinition,
  filterByKeyword,
} from './components/Utils';
import {
  AnnotationImplication,
  TreatmentImplication,
  MUTATIONS_TABLE_COLUMN_KEY,
  TherapeuticImplication,
} from './config/constants';

export interface AnnotationVisualisationProps {
  annotations: AnnotationImplication[];
  treatments: TreatmentImplication[];
  patientId: string;
  patientInfo: string;
}

export class AnnotationVisualisation extends React.Component<
  AnnotationVisualisationProps
> {
  @computed
  get treatmentTableColumns(): SearchColumn<TherapeuticImplication>[] {
    const treatmentTableColumns: SearchColumn<TherapeuticImplication>[] = [
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.BIOMARKER),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.biomarker, keyword),
      },
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.DRUG),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.drug, keyword),
      },
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.LEVEL),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.level, keyword),
      },
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.ANNOTATION),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.annotation, keyword),
      },
    ];

    return treatmentTableColumns;
  }

  @computed
  get annotationTableColumns(): SearchColumn<TherapeuticImplication>[] {
    const annotationTableColumns: SearchColumn<TherapeuticImplication>[] = [
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.GENE),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.gene, keyword),
      },
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.MUTATION),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.mutation, keyword),
      },
      {
        ...getDefaultColumnDefinition(
          MUTATIONS_TABLE_COLUMN_KEY.CONSEQUENCE_TYPE
        ),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.consequenceType, keyword),
      },
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.DRUG),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.drug, keyword),
      },
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.LOCATION),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.location, keyword),
      },
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.ONCOGENICITY),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.oncogenicity, keyword),
      },
      {
        ...getDefaultColumnDefinition(
          MUTATIONS_TABLE_COLUMN_KEY.BIOLOGICAL_EFFECT
        ),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.biologicalEffect, keyword),
      },
      {
        ...getDefaultColumnDefinition(MUTATIONS_TABLE_COLUMN_KEY.LEVEL),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.level, keyword),
      },
    ];

    return annotationTableColumns;
  }

  render() {
    return (
      <>
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
        <div>
          <div className="mt-4">
            <GenePageTable
              name={'Mutations in the table'}
              data={this.props.annotations}
              columns={this.annotationTableColumns}
              isPending={false}
            />
          </div>
          <div className="mt-4">
            <GenePageTable
              name={'Treatments for the Biomarker'}
              data={this.props.treatments}
              columns={this.treatmentTableColumns}
              isPending={false}
            />
          </div>
        </div>
      </>
    );
  }
}
