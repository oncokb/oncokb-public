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

const COLUMNS = [
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

const TABLE_TITLE: { [level in LEVELS]?: string } = {
  [LEVELS.Tx1]:
    'Biomarkers listed in the tumor type specific “Indications and Usage” section of the FDA-drug label',
  [LEVELS.Tx2]:
    'Biomarkers listed in the treatment recommendations section of a tumor type specific National Comprehensive Cancer Network (NCCN) guideline',
  [LEVELS.Tx3]:
    'Biomarkers predictive of response to targeted agents as demonstrated by phase III clinical evidence, compelling phase I/II trial data',
  [LEVELS.Tx4]:
    'Biomarkers predictive of response to targeted agents as demonstrated by compelling biological evidence',
};

export type TableData = { [level in LEVELS]?: (string | ElementType)[][] };
export const BiomarkerTable = (props: {
  tableKey: string;
  year: string;
  data: TableData;
}) => {
  return (
    <>
      {LEVEL_PRIORITY.filter(level => !!props.data[level])
        .reverse()
        .map(level => (
          <div key={`biomarker-table-div-${level}`}>
            {TABLE_TITLE[level] && (
              <b
                style={{ fontWeight: 500 }}
              >{`Level ${level}: ${TABLE_TITLE[level]} in ${props.year}`}</b>
            )}
            <Row className={'overflow-auto'}>
              <Col>
                <SimpleTable
                  theadClassName={styles.header}
                  columns={COLUMNS}
                  rows={props.data[level]!.map(
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
