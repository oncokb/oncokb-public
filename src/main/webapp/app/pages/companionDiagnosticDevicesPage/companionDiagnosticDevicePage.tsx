import OncoKBTable, {
  ColumnFilters,
  filterByColumnFilters,
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { FilterTypes } from 'app/components/oncokbTable/filters/types';
import companionDiagnosticDevices from 'content/files/companionDiagnosticDevices/companion_diagnostic_devices.json';
import {
  LG_TABLE_FIXED_HEIGHT,
  ONCOKB_TM,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
} from 'app/config/constants';
import {
  filterByKeyword,
  getAllTumorTypesName,
  getCancerTypeNameFromOncoTreeType,
  getPageTitle,
} from 'app/shared/utils/Utils';
import React, { useState, useMemo } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import WithSeparator from 'react-with-separator';
import { AlterationPageLink, GenePageLink } from 'app/shared/utils/UrlUtils';
import { pluralize } from 'cbioportal-frontend-commons';
import { downloadFile } from 'app/shared/utils/FileUtils';
import {
  sortByStringArray,
  tumorTypeSortMethod,
} from 'app/shared/utils/ReactTableUtils';
import { FdaSubmissionLink } from 'app/shared/links/FdaSubmissionLink';
import { Linkout } from 'app/shared/links/Linkout';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { uniq } from 'app/shared/utils/LodashUtils';
import { Helmet } from 'react-helmet-async';

export interface ICompanionDiagnosticDevice {
  name: string;
  manufacturer: string;
  platformType?: string | null;
  biomarkerAssociation: IBiomarkerAssociation;
  specimenTypes?: string[];
}

export interface IFdaSubmission {
  id: number;
  number: string;
  supplementNumber: string;
  deviceName: string;
  genericName: string;
  dateReceived: string;
  decisionDate: string;
  description: string;
  curated: boolean;
  genetic: boolean;
  note: string;
  associations: any[];
  type: IFdaSubmissionType;
}

interface IFdaSubmissionType {
  id: number;
  type: string;
  name: string;
  shortName: string;
  description: string;
}

interface IBiomarkerAssociation {
  id: number;
  gene: string;
  alterations: string[];
  drugs: string;
  cancerTypes: ICancerType[];
  fdaSubmissions: any[];
  associationId: number;
}

interface ICancerType {
  code: string;
  color: string;
  id: number;
  level: number;
  mainType: string;
  subtype: string;
  tissue: string;
  tumorForm: 'SOLID' | 'LIQUID' | 'MIXED';
}

interface IRule {
  id: number;
  entity: string;
  rule: string;
  name: string | null;
  association: IAssociation | null;
}

interface IAssociation {
  id: number;
  name: string | null;
  rules: IRule[] | null;
  alterations: IAlteration[] | null;
  cancerTypes: ICancerType[] | null;
  drugs: IDrug[] | null;
  fdaSubmissions: IFdaSubmission[] | null;
}

interface IDrug {
  id: number;
  uuid: string;
  name: string;
  associations: IAssociation[] | null;
}

interface IAlteration {
  id: number;
  name: string;
  alteration: string;
  proteinChange: string;
  start: number | null;
  end: number | null;
  refResidues: string | null;
  variantResidues: string | null;
  genes: IGene[] | null;
  associations: IAssociation[] | null;
}

interface IGene {
  id: number;
  entrezGeneId: number;
  hugoSymbol: string;
  hgncId: string | null;
  alterations: IAlteration[] | null;
}

const referenceColumnInfo = (
  <div>
    Premarket Approval (PMA) / 510(k) or 513(f2) Premarket Notification /
    Humanitarian Device Exemption (HDE) (Approval/Clearance or Grant Date)
  </div>
);

const getDrugName = (drugs: IDrug[], rules: IRule[]) => {
  // Create a map of drug ids to drug names for quick lookup
  const drugMap = new Map();
  drugs.forEach((drug: any) => {
    drugMap.set(drug.id, drug.name);
  });

  const drugRule = rules.filter((rule: IRule) => rule.entity === 'DRUG')[0];

  if (!drugRule) {
    return drugs[0].name;
  }
  return drugRule.rule
    .split(/([+,])/)
    .map((part: any) => {
      const id = parseInt(part, 10);
      return isNaN(id) ? part : drugMap.get(id) || part;
    })
    .join('');
};

const parseCDx = () => {
  const parsedCompanionDiagnosticDevices: ICompanionDiagnosticDevice[] = [];
  for (const cdx of companionDiagnosticDevices) {
    const associationList: any[] = [];
    for (const fdaSubmission of cdx.fdaSubmissions) {
      const { associations, ...restFdaSubmission } = fdaSubmission;
      for (const association of associations) {
        const index = associationList.findIndex(
          assoc => assoc.id === association.id
        );
        if (index > -1) {
          associationList[index].fdaSubmissions.push({ ...restFdaSubmission });
        } else {
          associationList.push({
            ...association,
            fdaSubmissions: [{ ...restFdaSubmission }],
          });
        }
      }
    }

    associationList
      .map((assoc: any) => {
        return uniq(
          assoc.alterations.reduce(
            (acc: any[], alt: any) =>
              acc.concat(alt.genes.map((gene: any) => gene.hugoSymbol)),
            []
          )
        ).map((gene: any) => ({
          gene,
          alterations: uniq(assoc.alterations.map((a: any) => a.name)).sort(),
          drugs: getDrugName(assoc.drugs, assoc.rules),
          cancerTypes: assoc.cancerTypes,
          fdaSubmissions: assoc.fdaSubmissions,
          associationId: assoc.id,
        }));
      })
      .flat()
      .forEach((assoc: IBiomarkerAssociation) => {
        parsedCompanionDiagnosticDevices.push({
          name: cdx.name,
          manufacturer: cdx.manufacturer,
          platformType: cdx.platformType,
          specimenTypes: cdx.specimenTypes.map((st: any) => st.name).sort(),
          biomarkerAssociation: assoc,
        });
      });
  }
  return parsedCompanionDiagnosticDevices;
};
const parsedCDx: ICompanionDiagnosticDevice[] = parseCDx();

const downloadCDx = () => {
  const seperator = '\t';
  const headers = [
    'Gene',
    'Alteration(s)',
    'Cancer Type',
    'Drug(s)',
    'Companion Diagnostic Device',
    'Specimen Types(s)',
    'Platform Type',
  ].join(seperator);
  const rows = parsedCDx.map(cdx => {
    const row = [];
    row.push(cdx.biomarkerAssociation.gene);
    row.push(cdx.biomarkerAssociation.alterations.join(', '));
    row.push(getAllTumorTypesName(cdx.biomarkerAssociation.cancerTypes));
    row.push(cdx.biomarkerAssociation.drugs);
    row.push(`${cdx.name} (${cdx.manufacturer})`);
    row.push(cdx.specimenTypes?.join(', ') || '');
    row.push(cdx.platformType || '');
    return row.join(seperator);
  });

  downloadFile(
    'companion_diagnostic_devices.tsv',
    [headers, ...rows].join('\r\n')
  );
};

const columns: SearchColumn<ICompanionDiagnosticDevice>[] = [
  {
    id: 'gene',
    accessor: 'biomarkerAssociation.gene',
    Header: <span>Gene</span>,
    filterType: FilterTypes.STRING,
    getColumnFilterValue: (cdx: ICompanionDiagnosticDevice) =>
      cdx.biomarkerAssociation.gene,
    Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
      return (
        <GenePageLink
          hugoSymbol={tableProps.original.biomarkerAssociation.gene}
        />
      );
    },
    minWidth: 100,
    maxWidth: 105,
  },
  {
    id: 'alterations',
    accessor: 'biomarkerAssociation.alterations',
    Header: <span>Alteration(s)</span>,
    filterType: FilterTypes.STRING,
    getColumnFilterValue: (cdx: ICompanionDiagnosticDevice) =>
      cdx.biomarkerAssociation.alterations,
    Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
      return (
        <WithSeparator separator={', '}>
          {tableProps.original.biomarkerAssociation.alterations.map(a => (
            <AlterationPageLink
              key={a}
              hugoSymbol={tableProps.original.biomarkerAssociation.gene}
              alteration={a}
            />
          ))}
        </WithSeparator>
      );
    },
    defaultSortDesc: false,
    sortMethod: sortByStringArray,
    minWidth: 160,
    maxWidth: 180,
  },
  {
    id: 'cancerTypes',
    accessor: 'biomarkerAssociation.cancerTypes',
    Header: <span>Cancer Type(s)</span>,
    filterType: FilterTypes.CANCER_TYPE,
    getColumnFilterValue: (cdx: ICompanionDiagnosticDevice) =>
      cdx.biomarkerAssociation.cancerTypes.map(
        getCancerTypeNameFromOncoTreeType
      ),
    getColumnExcludedFilterValue: () => [],
    Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
      return (
        <span>
          {getAllTumorTypesName(
            tableProps.original.biomarkerAssociation.cancerTypes
          )}
        </span>
      );
    },
    sortMethod: tumorTypeSortMethod,
    minWidth: 160,
  },
  {
    id: 'drugs',
    accessor: 'biomarkerAssociation.drugs',
    Header: <span>Drug(s)</span>,
    filterType: FilterTypes.STRING,
    getColumnFilterValue: (cdx: ICompanionDiagnosticDevice) =>
      cdx.biomarkerAssociation.drugs,
    Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
      return (
        <span>
          {tableProps.original.biomarkerAssociation.drugs
            .split(/([+,])/)
            .map((part, index) =>
              part === '+' || part === ',' ? (
                <React.Fragment key={index}>
                  {part}
                  <wbr />
                </React.Fragment>
              ) : (
                part
              )
            )}
        </span>
      );
    },
    minWidth: 135,
    maxWidth: 135,
  },
  {
    id: 'name',
    accessor: 'name',
    Header: <span>Companion Diagnostic Device</span>,
    filterType: FilterTypes.STRING,
    getColumnFilterValue: (cdx: ICompanionDiagnosticDevice) =>
      `${cdx.name} (${cdx.manufacturer})`,
    onFilter: (data: ICompanionDiagnosticDevice, keyword) =>
      filterByKeyword(data.name, keyword),
    Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
      return (
        <span>
          {`${tableProps.original.name} (${tableProps.original.manufacturer})`}
        </span>
      );
    },
    minWidth: 195,
  },
  {
    id: 'specimenType',
    accessor: 'specimenTypes',
    Header: <span>Specimen Type(s)</span>,
    filterType: FilterTypes.STRING,
    getColumnFilterValue: (cdx: ICompanionDiagnosticDevice) =>
      cdx.specimenTypes,
    Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
      return <span>{tableProps.original?.specimenTypes?.join(', ')}</span>;
    },
    sortMethod: sortByStringArray,
    minWidth: 140,
    maxWidth: 150,
  },
  {
    accessor: 'platformType',
    Header: <span>Platform Type</span>,
    filterType: FilterTypes.STRING,
    getColumnFilterValue: (cdx: ICompanionDiagnosticDevice) =>
      cdx.platformType || undefined,
    minWidth: 130,
    maxWidth: 130,
  },
  {
    id: 'fdaSubmission',
    Header: (
      <span>
        Reference(s){' '}
        <InfoIcon
          className={'ml-2'}
          overlay={<span>{referenceColumnInfo}</span>}
        />
      </span>
    ),
    Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
      const assoc = tableProps.original.biomarkerAssociation;
      // TODO: Remove once we support https://github.com/oncokb/oncokb-pipeline/issues/969
      // Reason is that this association is pending on FDA, so there is no PMA.
      if (assoc.associationId === 319) {
        return <span>PMA not available as of 11/24/25</span>;
      }
      return (
        <WithSeparator separator=", ">
          {assoc.fdaSubmissions.map((fdaSubmission: IFdaSubmission) => (
            <FdaSubmissionLink
              key={`${fdaSubmission.id}-${fdaSubmission.number}-${fdaSubmission.supplementNumber}`}
              fdaSubmission={fdaSubmission}
            />
          ))}
        </WithSeparator>
      );
    },
    sortable: false,
    minWidth: 130,
    maxWidth: 135,
  },
];

const CompanionDiagnosticDevicePage: React.FunctionComponent<{}> = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});

  const filteredCDx = useMemo(
    () => filterByColumnFilters(parsedCDx, columns, columnFilters),
    [columnFilters]
  );

  const hasFilter = Object.keys(columnFilters).some(
    columnId => columnFilters[columnId].size > 0
  );

  const clearFilters = () => setColumnFilters({});

  const filteredCancerTypes = useMemo(() => {
    return uniq(
      filteredCDx.map(cdx =>
        getAllTumorTypesName(cdx.biomarkerAssociation.cancerTypes)
      )
    );
  }, [filteredCDx]);

  const filteredCdxNames = useMemo(() => {
    return uniq(filteredCDx.map(cdx => cdx.name));
  }, [filteredCDx]);

  const filteredGenes = useMemo(() => {
    return uniq(filteredCDx.map(cdx => cdx.biomarkerAssociation.gene));
  }, [filteredCDx]);

  const filterSummary = useMemo(() => {
    const uniqueDrugs = uniq(
      filteredCDx.flatMap(filtered => filtered.biomarkerAssociation.drugs)
    );
    return (
      <>
        <b>
          Showing {filteredCDx.length} biomarker and cancer type-specific CDx
          associations{' '}
        </b>
        <span>
          (
          <WithSeparator separator={', '}>
            <span>
              {`${filteredGenes.length} ${pluralize(
                'gene',
                filteredGenes.length
              )}`}
            </span>
            <span>
              {`${filteredCancerTypes.length} ${pluralize(
                'cancer type',
                filteredCancerTypes.length
              )}`}
            </span>
            <span>
              {`${uniqueDrugs.length} ${pluralize('drug', uniqueDrugs.length)}`}
            </span>
            <span>
              {`${filteredCdxNames.length} ${pluralize(
                'companion diagnostic device',
                filteredCDx.length
              )}`}
            </span>
          </WithSeparator>
          )
        </span>
      </>
    );
  }, [filteredCDx]);

  return (
    <>
      <Helmet>
        <title>{getPageTitle(PAGE_TITLE.CDX)}</title>
        <meta name="description" content={PAGE_DESCRIPTION.CDX}></meta>
      </Helmet>
      <Row>
        <Col>
          <h2 className={'mb-3'}>
            FDA Cleared or Approved Companion Diagnostic Devices
          </h2>
          <div className={'mb-2'}>Content current as of 05/28/2026</div>
          <div className={'mb-2'}>
            Companion diagnostic devices (CDx) approved or cleared by the FDA
            are required to detect the {ONCOKB_TM} Level 1 biomarkers specified
            in the drug labels of precision oncology therapies. The devices
            listed here are a subset of those in the FDA&apos;s{' '}
            <Linkout link="https://www.fda.gov/medical-devices/in-vitro-diagnostics/list-cleared-or-approved-companion-diagnostic-devices-in-vitro-and-imaging-tools">
              List of Cleared or Approved Companion Diagnostic Devices (In Vitro
              and Imaging Tools)
            </Linkout>
            .
          </div>
        </Col>
      </Row>
      <Row>
        <Col className={'d-flex align-items-center justify-content-between'}>
          <div>
            <div>{filterSummary}</div>
            {hasFilter ? (
              <Button
                variant="outline-primary"
                style={{ whiteSpace: 'nowrap' }}
                onClick={clearFilters}
                size={'sm'}
              >
                <span className={'fa fa-times mr-1'}></span>
                Reset filters
              </Button>
            ) : undefined}
          </div>
          <Button
            size="sm"
            style={{ whiteSpace: 'nowrap' }}
            className={'ml-2'}
            onClick={() => downloadCDx()}
          >
            <i className={'fa fa-cloud-download mr-1'} /> Download Table
          </Button>
        </Col>
      </Row>
      <Row>
        <Col className={'mt-2'}>
          <OncoKBTable
            columns={columns}
            data={parsedCDx}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            pageSize={filteredCDx.length < 10 ? 10 : filteredCDx.length}
            disableSearch
            style={{
              height: LG_TABLE_FIXED_HEIGHT,
            }}
            defaultSorted={[
              {
                id: 'gene',
                desc: false,
              },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default CompanionDiagnosticDevicePage;
