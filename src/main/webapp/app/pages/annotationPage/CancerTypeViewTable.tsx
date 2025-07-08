import { CitationTooltip } from 'app/components/CitationTooltip';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { LEVELS } from 'app/config/constants';
import { ImplicationDescriptionCell } from 'app/pages/annotationPage/ImplicationDescriptionCell';
import { Citations } from 'app/shared/api/generated/OncoKbAPI';
import { FdaLevelIcon, OncoKBLevelIcon } from 'app/shared/utils/Utils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import React from 'react';
import { Else, If, Then } from 'react-if';
import styles from './index.module.scss';

export type DataType = 'tx' | 'dx' | 'px' | 'fda';

export interface ITable {
  userAuthenticated: boolean;
  type: DataType;
  hugoSymbol: string;
  data: ITableRow[];
}

export interface ITableRow {
  level: LEVELS;
  alterations: string;
  cancerTypes: string;
  drugs?: string;
  citations?: Citations;
  description?: string;
}

type DrugsToRows = { [drugs: string]: ITableRow[] };

function getDrugAssociationCellText(
  hugoSymbol: string,
  alterations: string,
  cancerTypes: string
) {
  const altNameIncludesHugoSymbol = alterations.includes(hugoSymbol);
  return `${
    altNameIncludesHugoSymbol ? '' : hugoSymbol
  } ${alterations} in ${cancerTypes}`;
}

const CompactDrugCell: React.FunctionComponent<{
  hugoSymbol: string;
  alterations: string;
  cancerTypes: string;
  drugs: string;
}> = props => {
  return (
    <div style={{ minWidth: 300 }}>
      <div>{props.drugs}</div>
      <div className={'text-secondary'}>
        {getDrugAssociationCellText(
          props.hugoSymbol,
          props.alterations,
          props.cancerTypes
        )}
      </div>
    </div>
  );
};

function getColumns(
  userAuthenticated: boolean,
  type: DataType,
  hasDescription: boolean
) {
  let columns: string[] = [];
  switch (type) {
    case 'tx':
      columns = ['Drugs', 'Level', 'Associated With'];
      if (!userAuthenticated) {
        columns.push('Citation');
      }
      if (hasDescription) {
        columns.push('Description');
      }
      break;
    case 'dx':
    case 'px':
      columns = [
        'Level of Evidence',
        'Alterations',
        'Level-associated cancer types',
        'Citations',
      ];
      break;
    case 'fda':
      columns = ['FDA Level', 'Alterations', 'Level-associated cancer types'];
      break;
    default:
      break;
  }
  return columns;
}

function tableHasDescriptionInfo(data: ITableRow[]) {
  return data.filter(row => !!row.description).length > 0;
}

function getRows(
  userAuthenticated: boolean,
  type: DataType,
  data: ITableRow[]
) {
  return data.map((row, index) => {
    const content = [
      {
        key: `${type}-row-${index}-level`,
        content: (
          <div>
            <If condition={type === 'fda'}>
              <Then>
                <FdaLevelIcon level={row.level} withDescription />
              </Then>
              <Else>
                <OncoKBLevelIcon level={row.level} withDescription />
              </Else>
            </If>
          </div>
        ),
      },
    ];

    content.push({
      key: `${type}-row-${index}-alterations}`,
      content: <span>{row.alterations}</span>,
    });
    content.push({
      key: `${type}-row-${index}-cancerTypes}`,
      content: <span>{row.cancerTypes}</span>,
    });

    const numOfReferences = row.citations
      ? row.citations.abstracts.length + row.citations.pmids.length
      : 0;
    if (numOfReferences > 0) {
      content.push({
        key: `${type}-row-${index}-citations}`,
        content: (
          <DefaultTooltip
            placement={'left'}
            overlay={() =>
              row.citations ? (
                <CitationTooltip
                  pmids={row.citations.pmids}
                  abstracts={row.citations.abstracts}
                />
              ) : undefined
            }
          >
            <span>{numOfReferences}</span>
          </DefaultTooltip>
        ),
      });
    }
    return {
      key: `${type}-row-${index}`,
      content,
    };
  });
}

function getTxRows(
  userAuthenticated: boolean,
  data: ITableRow[],
  hugoSymbol: string,
  hasDescription: boolean
): SimpleTableRow[] {
  const drugsToRows: DrugsToRows = {};
  for (const row of data) {
    const drugs = row.drugs!;
    if (drugsToRows[drugs]) {
      drugsToRows[drugs].push();
    }
    drugsToRows[drugs]
      ? drugsToRows[drugs].push(row)
      : (drugsToRows[drugs] = [row]);
  }

  const type = 'tx';
  const rows: SimpleTableRow[] = [];

  const entries = Object.entries(drugsToRows);
  let rowIndex = 0;
  for (const [drugs, rowData] of entries) {
    for (let i = 0; i < rowData.length; i++) {
      const content = [];
      const currentRowData = rowData[i];

      if (i === 0) {
        content.push({
          key: `${type}-row-${rowIndex}-drugs}`,
          content: <span>{drugs}</span>,
        });
      } else {
        content.push({
          key: `${type}-row-${rowIndex}-drugs}`,
          content: undefined,
        });
      }
      content.push({
        key: `${type}-row-${rowIndex}-level`,
        content: (
          <div>
            <OncoKBLevelIcon level={currentRowData.level} withDescription />
          </div>
        ),
      });
      content.push({
        key: `${type}-row-${rowIndex}-drugs}`,
        content: getDrugAssociationCellText(
          hugoSymbol,
          currentRowData.alterations,
          currentRowData.cancerTypes
        ),
      });
      if (!userAuthenticated) {
        const numOfReferences = currentRowData.citations
          ? currentRowData.citations.abstracts.length +
            currentRowData.citations.pmids.length
          : 0;

        content.push({
          key: `${type}-row-${i}-citations}`,
          content: (
            <DefaultTooltip
              placement={'left'}
              overlay={() =>
                currentRowData.citations ? (
                  <CitationTooltip
                    pmids={currentRowData.citations.pmids}
                    abstracts={currentRowData.citations.abstracts}
                  />
                ) : undefined
              }
            >
              <span>{numOfReferences}</span>
            </DefaultTooltip>
          ),
        });
      }
      if (hasDescription) {
        content.push({
          key: `tx-row-${rowIndex}-description}`,
          content: (
            <ImplicationDescriptionCell
              userAuthenticated={userAuthenticated}
              description={currentRowData.description || ''}
            />
          ),
        });
      }

      rows.push({ key: `${type}-row-${i}`, content });
      rowIndex++;
    }
  }
  return rows;
}

export const CancerTypeViewTable: React.FunctionComponent<ITable> = props => {
  // we only show tx description at the moment
  const hasDescription =
    props.type === 'tx' && tableHasDescriptionInfo(props.data);
  const columns = getColumns(
    props.userAuthenticated,
    props.type,
    hasDescription
  );
  return (
    <SimpleTable
      theadClassName={styles.cancerTypeSimpleTableHead}
      columns={columns.map(column => {
        return { name: column };
      })}
      rows={
        props.type === 'tx'
          ? getTxRows(
              props.userAuthenticated,
              props.data,
              props.hugoSymbol,
              hasDescription
            )
          : getRows(props.userAuthenticated, props.type, props.data)
      }
    />
  );
};
