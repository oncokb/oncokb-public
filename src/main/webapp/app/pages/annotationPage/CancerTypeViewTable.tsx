import React from 'react';
import { SimpleTable } from 'app/components/SimpleTable';
import { LEVELS } from 'app/config/constants';
import { FdaLevelIcon, OncoKBLevelIcon } from 'app/shared/utils/Utils';
import { CitationTooltip } from 'app/components/CitationTooltip';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { Citations } from 'app/shared/api/generated/OncoKbAPI';
import { ImplicationDescriptionCell } from 'app/pages/annotationPage/ImplicationDescriptionCell';
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

const CompactDrugCell: React.FunctionComponent<{
  hugoSymbol: string;
  alterations: string;
  cancerTypes: string;
  drugs: string;
}> = props => {
  const altNameIncludesHugoSymbol = props.alterations.includes(
    props.hugoSymbol
  );
  return (
    <div style={{ minWidth: 300 }}>
      <div>{props.drugs}</div>
      <div className={'text-secondary'}>
        Associated with{' '}
        {altNameIncludesHugoSymbol ? '' : `${props.hugoSymbol} `}
        {props.alterations}
      </div>
      <div className={'text-secondary'}>
        in {props.cancerTypes.toLowerCase()}
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
  data: ITableRow[],
  hugoSymbol: string,
  hasDescription: boolean
) {
  return data.map((row, index) => {
    const content = [
      {
        key: `${type}-row-${index}-level`,
        content: (
          <div className={'mt-1'}>
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

    // only add the compact drug column for tx implications when user logged in
    if (type === 'tx' && userAuthenticated && hasDescription) {
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
      if (type === 'tx') {
        // only add the drug column for tx implications
        content.push({
          key: `${type}-row-${index}-drugs}`,
          content: <span>{row.drugs}</span>,
        });
      }
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
    if (type !== 'fda') {
      if (!userAuthenticated || type !== 'tx' || !hasDescription) {
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
      rows={getRows(
        props.userAuthenticated,
        props.type,
        props.data,
        props.hugoSymbol,
        hasDescription
      )}
    />
  );
};
