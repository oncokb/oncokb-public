import React from 'react';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { LEVELS, LONG_TEXT_CUTOFF_COMPACT } from 'app/config/constants';
import { FdaLevelIcon, OncoKBLevelIcon } from 'app/shared/utils/Utils';
import { CitationTooltip } from 'app/components/CitationTooltip';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { Citations } from 'app/shared/api/generated/OncoKbAPI';
import { ImplicationDescriptionCell } from 'app/pages/annotationPage/ImplicationDescriptionCell';
import { Else, If, Then } from 'react-if';
import styles from './index.module.scss';
import WindowStore from 'app/store/WindowStore';
import { LongText } from 'app/oncokb-frontend-commons/src/components/LongText';

export type DataType = 'tx' | 'dx' | 'px' | 'fda';

export interface ITable {
  userAuthenticated: boolean;
  type: DataType;
  hugoSymbol: string;
  data: ITableRow[];
  isLargeScreen: boolean;
}

export interface ITableRow {
  level: LEVELS;
  alterations: string;
  cancerTypes: string;
  drugs?: string;
  citations?: Citations;
  description?: string;
}

function inCompactView(store: WindowStore) {
  return !store.isLargeScreen;
}

function geDrugAssociationCellText(
  hugoSymbol: string,
  alterations: string,
  cancerTypes: string
) {
  const altNameIncludesHugoSymbol = alterations.includes(hugoSymbol);
  return `Associated with ${
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
        {geDrugAssociationCellText(
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
      if (userAuthenticated && hasDescription) {
        columns = [];
      } else {
        columns = [
          'Level of Evidence',
          'Drugs',
          'Alterations',
          'Level-associated cancer types',
          'Citations',
        ];
        if (hasDescription) {
          columns.push('Description');
        }
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

function getCompactTxRows(
  userAuthenticated: boolean,
  data: ITableRow[],
  hugoSymbol: string
): SimpleTableRow[] {
  const type = 'tx';
  return data.map((row, index) => {
    const content = [
      {
        key: `${type}-row-${index}`,
        content: (
          <div className={'d-flex flex-column'}>
            <div className={'d-flex flex-row'}>
              <div className={'mr-3'}>
                <OncoKBLevelIcon level={row.level} withDescription />
              </div>
              <div>
                <b>{row.drugs}</b>
              </div>
            </div>
            <div className={'text-secondary'}>
              <LongText
                text={geDrugAssociationCellText(
                  hugoSymbol,
                  row.alterations,
                  row.cancerTypes
                )}
                cutoff={LONG_TEXT_CUTOFF_COMPACT}
              />
            </div>
            <div>
              <ImplicationDescriptionCell
                userAuthenticated={userAuthenticated}
                description={row.description || ''}
                cutoff={LONG_TEXT_CUTOFF_COMPACT}
              />
            </div>
          </div>
        ),
      },
    ];
    return {
      key: `${type}-row-${index}`,
      content,
    };
  });
}

function getNoneCompactTxRows(
  userAuthenticated: boolean,
  data: ITableRow[],
  hugoSymbol: string,
  hasDescription: boolean
): SimpleTableRow[] {
  const type = 'tx';
  return data.map((row, index) => {
    const content = [
      {
        key: `${type}-row-${index}-level`,
        content: (
          <div className={'mt-1'}>
            <OncoKBLevelIcon level={row.level} withDescription />
          </div>
        ),
      },
    ];

    // only add the compact drug column for tx implications when user logged in
    if (userAuthenticated && hasDescription) {
      content.push({
        key: `${type}-row-${index}-compact-drugs}`,
        content: row.drugs ? (
          <CompactDrugCell
            hugoSymbol={hugoSymbol}
            alterations={row.alterations}
            drugs={row.drugs}
            cancerTypes={row.cancerTypes}
          />
        ) : (
          <></>
        ),
      });
    } else {
      content.push({
        key: `${type}-row-${index}-drugs}`,
        content: <span>{row.drugs}</span>,
      });
      content.push({
        key: `${type}-row-${index}-alterations}`,
        content: <span>{row.alterations}</span>,
      });
      content.push({
        key: `${type}-row-${index}-cancerTypes}`,
        content: <span>{row.cancerTypes}</span>,
      });
    }

    // only add the citations column if the table is not tx implications or when user not logged in
    if (!userAuthenticated || !hasDescription) {
      const numOfReferences = row.citations
        ? row.citations.abstracts.length + row.citations.pmids.length
        : 0;
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

    if (hasDescription) {
      content.push({
        key: `tx-row-${index}-description}`,
        content: (
          <ImplicationDescriptionCell
            userAuthenticated={userAuthenticated}
            description={row.description || ''}
          />
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
  hasDescription: boolean,
  isLargeScreen: boolean
): SimpleTableRow[] {
  return !isLargeScreen && userAuthenticated
    ? getCompactTxRows(userAuthenticated, data, hugoSymbol)
    : getNoneCompactTxRows(userAuthenticated, data, hugoSymbol, hasDescription);
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
              hasDescription,
              props.isLargeScreen
            )
          : getRows(props.userAuthenticated, props.type, props.data)
      }
    />
  );
};
