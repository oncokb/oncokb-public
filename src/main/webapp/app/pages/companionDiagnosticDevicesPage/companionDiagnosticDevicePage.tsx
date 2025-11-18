import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import Select from 'react-select';
import companionDiagnosticDevices from 'content/files/companionDiagnosticDevices/companion_diagnostic_devices.json';
import {
  COMPONENT_PADDING,
  LG_TABLE_FIXED_HEIGHT,
  ONCOKB_TM,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
} from 'app/config/constants';
import {
  filterByKeyword,
  getAllTumorTypesName,
  getPageTitle,
} from 'app/shared/utils/Utils';
import React, { useEffect, useState, useMemo } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import classnames from 'classnames';
import WithSeparator from 'react-with-separator';
import { AlterationPageLink, GenePageLink } from 'app/shared/utils/UrlUtils';
import { pluralize } from 'cbioportal-frontend-commons';
import { downloadFile } from 'app/shared/utils/FileUtils';
import CancerTypeSelect from 'app/shared/dropdown/CancerTypeSelect';
import {
  sortByStringArray,
  tumorTypeSortMethod,
} from 'app/shared/utils/ReactTableUtils';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { TumorType } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { FdaSubmissionLink } from 'app/shared/links/FdaSubmissionLink';
import { Linkout } from 'app/shared/links/Linkout';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { sortByKey, uniq, uniqBy } from 'app/shared/utils/LodashUtils';
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

type SelectOption = {
  value: string;
  label: string;
};

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

const CompanionDiagnosticDevicePage: React.FunctionComponent<{}> = () => {
  const [hasFilter, setHasFilter] = useState(false);
  const [filteredCDx, setFilteredCdx] = useState<ICompanionDiagnosticDevice[]>(
    parsedCDx
  );
  const [selectedAlterations, setSelectedAlterations] = useState<
    SelectOption[]
  >([]);
  const [selectedGenes, setSelectedGenes] = useState<SelectOption[]>([]);
  const [selectedCancerTypes, setSelectedCancerTypes] = useState<
    SelectOption[]
  >([]);
  const [selectedDrugs, setSelectedDrugs] = useState<SelectOption[]>([]);
  const [selectedCDxs, setSelectedCDxs] = useState<SelectOption[]>([]);

  useEffect(() => {
    const filterPresent =
      selectedCancerTypes.length > 0 ||
      selectedDrugs.length > 0 ||
      selectedCDxs.length > 0 ||
      selectedAlterations.length > 0 ||
      selectedGenes.length > 0;
    setHasFilter(filterPresent);

    const getFilteredCdx = async () => {
      if (filterPresent) {
        let rcts: TumorType[] = [];
        for (const ct of selectedCancerTypes) {
          rcts = rcts.concat(
            await privateClient.utilRelevantTumorTypesGetUsingGET({
              tumorType: ct.label,
            })
          );
        }
        const filtered = parsedCDx.filter(cdx => {
          if (
            selectedCDxs.length > 0 &&
            selectedCDxs.filter(selectedCDx =>
              cdx.name.toLowerCase().includes(selectedCDx.value.toLowerCase())
            ).length === 0
          ) {
            return false;
          }
          if (
            selectedGenes.length > 0 &&
            selectedGenes.filter(selectedGene =>
              cdx.biomarkerAssociation.gene.includes(selectedGene.value)
            ).length === 0
          ) {
            return false;
          }

          if (selectedCancerTypes.length > 0) {
            if (
              cdx.biomarkerAssociation.cancerTypes.filter(ct => {
                if (
                  rcts.filter(rct => {
                    if (rct.code) {
                      return rct.code === ct.code || rct.subtype === ct.subtype;
                    } else {
                      return rct.mainType === ct.mainType;
                    }
                  }).length === 0
                ) {
                  return false;
                }
                return true;
              }).length === 0
            ) {
              return false;
            }
          }
          if (
            selectedDrugs.length > 0 &&
            selectedDrugs.filter(selectedDrug =>
              cdx.biomarkerAssociation.drugs
                .toLowerCase()
                .includes(selectedDrug.value.toLowerCase())
            ).length === 0
          ) {
            return false;
          }
          if (
            selectedAlterations.length > 0 &&
            cdx.biomarkerAssociation.alterations.filter(a =>
              selectedAlterations.some(sa =>
                sa.value.toLowerCase().includes(a.toLowerCase())
              )
            ).length === 0
          ) {
            return false;
          }
          return true;
        });
        setFilteredCdx([...filtered]);
      } else {
        setFilteredCdx(parsedCDx);
      }
    };

    getFilteredCdx();
  }, [
    selectedGenes,
    selectedCancerTypes,
    selectedDrugs,
    selectedCDxs,
    selectedAlterations,
  ]);

  const clearFilters = () => {
    setSelectedCancerTypes([]);
    setSelectedDrugs([]);
    setSelectedCDxs([]);
    setSelectedGenes([]);
    setSelectedAlterations([]);
  };

  const columns: SearchColumn<ICompanionDiagnosticDevice>[] = [
    {
      id: 'gene',
      accessor: 'biomarkerAssociation.gene',
      Header: <span>Gene</span>,
      Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
        return (
          <GenePageLink
            hugoSymbol={tableProps.original.biomarkerAssociation.gene}
          />
        );
      },
    },
    {
      id: 'alterations',
      accessor: 'biomarkerAssociation.alterations',
      Header: <span>Alteration(s)</span>,
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
    },
    {
      id: 'cancerTypes',
      accessor: 'biomarkerAssociation.cancerTypes',
      Header: <span>Cancer Type(s)</span>,
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
      minWidth: 150,
    },
    {
      id: 'drugs',
      accessor: 'biomarkerAssociation.drugs',
      Header: <span>Drug(s)</span>,
      Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
        return <span>{tableProps.original.biomarkerAssociation.drugs}</span>;
      },
      minWidth: 150,
    },
    {
      id: 'name',
      accessor: 'name',
      Header: <span>Companion Diagnostic Device</span>,
      onFilter: (data: ICompanionDiagnosticDevice, keyword) =>
        filterByKeyword(data.name, keyword),
      Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
        return (
          <span>
            {`${tableProps.original.name} (${tableProps.original.manufacturer})`}
          </span>
        );
      },
      minWidth: 200,
    },
    {
      id: 'specimenType',
      accessor: 'specimenTypes',
      Header: <span>Specimen Type(s)</span>,
      Cell(tableProps: { original: ICompanionDiagnosticDevice }): JSX.Element {
        return <span>{tableProps.original?.specimenTypes?.join(', ')}</span>;
      },
      sortMethod: sortByStringArray,
    },
    { accessor: 'platformType', Header: <span>Platform Type</span> },
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
          return <span>PMA not available as of 11/20/25</span>;
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
    },
  ];

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
          <div className={'mb-2'}>Content current as of 04/25/2025</div>
          <div className={'mb-2'}>
            Companion diagnostic devices (CDx) that are US- Food and Drug
            Administration (FDA) approved or cleared to guide treatment
            decisions in cancer for the safe and efficient use of oncology drugs
            (per the FDA’s{' '}
            <Linkout link="https://www.fda.gov/medical-devices/in-vitro-diagnostics/list-cleared-or-approved-companion-diagnostic-devices-in-vitro-and-imaging-tools">
              List of Cleared or Approved Companion Diagnostic Devices (In Vitro
              and Imaging Tools)
            </Linkout>
            ). Only the companion diagnostics that are included in the FDA-drug
            labels of {ONCOKB_TM} level 1 precision oncology drugs and determine
            the list of {ONCOKB_TM} level 1 biomarkers are listed below.
          </div>
        </Col>
      </Row>
      <Row
        style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        className={'mb-2'}
      >
        <Col className={classnames(...COMPONENT_PADDING)} lg={2} md={6} xs={12}>
          <Select
            placeholder={'Gene(s)'}
            options={sortByKey(
              uniqBy(
                parsedCDx.map(cdx => ({
                  label: cdx.biomarkerAssociation.gene,
                  value: cdx.biomarkerAssociation.gene,
                })),
                'label'
              ),
              'label'
            )}
            isClearable={true}
            isMulti
            value={selectedGenes}
            closeMenuOnSelect={false}
            onChange={(selectedOptions: any[] | undefined) => {
              setSelectedGenes(selectedOptions || []);
            }}
          />
        </Col>
        <Col className={classnames(...COMPONENT_PADDING)} lg={2} md={6} xs={12}>
          <Select
            placeholder={'Alteration(s)'}
            options={sortByKey(
              uniq(
                parsedCDx.reduce((acc, curr) => {
                  acc = acc.concat(curr.biomarkerAssociation.alterations);
                  return acc;
                }, [] as string[])
              ).map(alt => ({
                label: alt,
                value: alt,
              })),
              'label'
            )}
            isClearable={true}
            isMulti
            value={selectedAlterations}
            closeMenuOnSelect={false}
            onChange={(selectedOptions: any[] | undefined) => {
              setSelectedAlterations(selectedOptions || []);
            }}
          />
        </Col>
        <Col className={classnames(...COMPONENT_PADDING)} lg={3} md={6} xs={12}>
          <CancerTypeSelect
            isMulti
            cancerTypes={selectedCancerTypes.map(ct => ct.label)}
            onChange={(selectedOptions: any) => {
              setSelectedCancerTypes(selectedOptions ? selectedOptions : []);
            }}
          />
        </Col>
        <Col className={classnames(...COMPONENT_PADDING)} lg={2} md={6} xs={12}>
          <Select
            placeholder={'Drug(s)'}
            options={sortByKey(
              uniqBy(
                parsedCDx.map(cdx => ({
                  label: cdx.biomarkerAssociation.drugs,
                  value: cdx.biomarkerAssociation.drugs,
                })),
                'label'
              ),
              'label'
            )}
            isClearable={true}
            isMulti
            value={selectedDrugs}
            closeMenuOnSelect={false}
            onChange={(selectedOption: any) => {
              setSelectedDrugs(selectedOption || []);
            }}
          />
        </Col>
        <Col className={classnames(...COMPONENT_PADDING)} lg={3} md={6} xs={12}>
          <Select
            placeholder={'CDx'}
            options={sortByKey(
              uniqBy(
                parsedCDx.map(cdx => ({
                  label: cdx.name,
                  value: cdx.name,
                })),
                'label'
              ),
              'label'
            )}
            isClearable={true}
            isMulti
            value={selectedCDxs}
            closeMenuOnSelect={false}
            onChange={(selectedOption: any) => {
              setSelectedCDxs(selectedOption || []);
            }}
          />
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
            data={filteredCDx}
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
