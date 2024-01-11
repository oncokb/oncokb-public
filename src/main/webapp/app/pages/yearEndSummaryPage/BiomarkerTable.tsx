import {
  ElementType,
  SimpleTable,
  SimpleTableColumn,
} from 'app/components/SimpleTable';
import { Col, Row } from 'react-bootstrap';
import React from 'react';
import styles from './main.module.scss';
import { LEVEL_PRIORITY, LEVELS } from 'app/config/constants';
import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';

const INCLUSION_COLUMNS = [
  { name: 'Molecular Biomarker' },
  { name: 'Cancer Type' },
  { name: 'Drug' },
  {
    name: 'Significance (Reason for inclusion in OncoKB)',
    content: (
      <div style={{ minWidth: 300 }}>
        <div>Significance</div>
        <div>(Reason for inclusion in OncoKB)</div>
      </div>
    ),
  },
];
const REMOVAL_COLUMNS = [
  { name: 'Molecular Biomarker' },
  { name: 'Cancer Type' },
  { name: 'Discontinued Drug' },
  { name: 'Previous Level of Evidence' },
  {
    name: 'Reason for removal from OncoKB',
    content: (
      <div style={{ minWidth: 300 }}>
        <div>Reason for removal from OncoKB</div>
      </div>
    ),
  },
];

export type TableKey = Record<LEVELS, string> & 'discontinued';

const TABLE_TITLE: { [level in TableKey]?: string } = {
  [LEVELS.Tx1]:
    'Level 1: Biomarkers listed in the tumor type specific “Indications and Usage” section of the FDA-drug label',
  [LEVELS.Tx2]:
    'Level 2: Biomarkers listed in the treatment recommendations section of a tumor type specific National Comprehensive Cancer Network (NCCN) guideline',
  [LEVELS.Tx3]:
    'Level 3: Biomarkers predictive of response to targeted agents as demonstrated by phase III clinical evidence, compelling phase I/II trial data',
  [LEVELS.Tx4]:
    'Level 4: Biomarkers predictive of response to targeted agents as demonstrated by compelling biological evidence',
  discontinued: 'Discontinued associations',
};

export type TableData = { [level in TableKey]?: (string | ElementType)[][] };
export const BiomarkerTable = (props: {
  tableKey: string;
  year: string;
  data: TableData;
}) => {
  const visualizedLevels = LEVEL_PRIORITY.filter(
    level => !!props.data[level]
  ).reverse();

  const tableKeys = [...visualizedLevels, 'discontinued'].filter(
    key => !!props.data[key]
  );

  return (
    <>
      {tableKeys.map(tableKey => (
        <div key={`biomarker-table-div-${tableKey}`}>
          {TABLE_TITLE[tableKey] && (
            <b
              style={{ fontWeight: 500 }}
            >{`${TABLE_TITLE[tableKey]} in ${props.year}`}</b>
          )}
          <Row className={'overflow-auto'}>
            <Col>
              <SimpleTable
                theadClassName={styles.header}
                columns={
                  tableKey === 'discontinued'
                    ? REMOVAL_COLUMNS
                    : INCLUSION_COLUMNS
                }
                rows={props.data[tableKey]!.map(
                  (item: ElementType[], index: number) => {
                    return {
                      key: `biomarker-table-${props.tableKey}-${index}`,
                      content: item.map((subItem, subIndex) => {
                        return {
                          key: `changedAnnotation-${props.tableKey}-${index}-${subIndex}`,
                          content: subItem,
                        };
                      }),
                    };
                  }
                )}
              />
            </Col>
          </Row>
        </div>
      ))}
    </>
  );
};
