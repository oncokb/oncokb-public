import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import Select from 'react-select';
import companionDiagnosticDevices from 'content/files/companionDiagnosticDevices/companion_diagnostic_devices.json';
import {
  COMPONENT_PADDING,
  LG_TABLE_FIXED_HEIGHT,
  ONCOKB_TM,
} from 'app/config/constants';
import { filterByKeyword, getAllTumorTypesName } from 'app/shared/utils/Utils';
import React, { useEffect, useState, useMemo } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import _ from 'lodash';
import classnames from 'classnames';
import { Input } from 'reactstrap';
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

    _.flatten(
      associationList.map((assoc: any) => {
        return _.uniq(
          assoc.alterations.reduce(
            (acc: any[], alt: any) =>
              acc.concat(alt.genes.map((gene: any) => gene.hugoSymbol)),
            []
          )
        ).map((gene: any) => ({
          gene,
          alterations: _.chain(assoc.alterations)
            .map((a: any) => a.name)
            .uniq()
            .sort()
            .value(),
          drugs: assoc.treatments
            .map((treatment: any) =>
              treatment.drugs.map((drug: any) => drug.name).join(' + ')
            )
            .join(', '),
          cancerTypes: assoc.associationCancerTypes.reduce(
            (ctAcc: any[], act: any) => {
              ctAcc.push(act.cancerType);
              return ctAcc;
            },
            []
          ),
          fdaSubmissions: assoc.fdaSubmissions,
        }));
      })
    ).forEach((assoc: IBiomarkerAssociation) => {
      parsedCompanionDiagnosticDevices.push({
        name: cdx.name,
        manufacturer: cdx.manufacturer,
        platformType: cdx.platformType,
        specimenTypes: _.chain(cdx.specimenTypes)
          .map((st: any) => st.name)
          .sort()
          .value(),
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
        return (
          <WithSeparator separator=", ">
            {tableProps.original.biomarkerAssociation.fdaSubmissions.map(
              (fdaSubmission: IFdaSubmission) => {
                return <FdaSubmissionLink fdaSubmission={fdaSubmission} />;
              }
            )}
          </WithSeparator>
        );
      },
      sortable: false,
    },
  ];

  const filteredCancerTypes = useMemo(() => {
    return _.chain(filteredCDx)
      .map(cdx => getAllTumorTypesName(cdx.biomarkerAssociation.cancerTypes))
      .uniq()
      .value();
  }, [filteredCDx]);

  const filteredCdxNames = useMemo(() => {
    return _.chain(filteredCDx)
      .map(cdx => cdx.name)
      .uniq()
      .value();
  }, [filteredCDx]);

  const filteredGenes = useMemo(() => {
    return _.chain(filteredCDx)
      .map(cdx => cdx.biomarkerAssociation.gene)
      .uniq()
      .value();
  }, [filteredCDx]);

  const filterSummary = useMemo(() => {
    const uniqueDrugs = _.uniq(
      _.flatMap(filteredCDx, 'biomarkerAssociation.drugs')
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
      <Row>
        <Col>
          <h2 className={'mb-3'}>
            FDA Cleared or Approved Companion Diagnostic Devices
          </h2>
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
            options={_.chain(parsedCDx)
              .map(cdx => ({
                label: cdx.biomarkerAssociation.gene,
                value: cdx.biomarkerAssociation.gene,
              }))
              .uniqBy('label')
              .sortBy('label')
              .value()}
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
            options={_.chain(parsedCDx)
              .reduce((acc, curr) => {
                acc = acc.concat(curr.biomarkerAssociation.alterations);
                return acc;
              }, [] as string[])
              .uniq()
              .map(alt => ({
                label: alt,
                value: alt,
              }))
              .sortBy('label')
              .value()}
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
            options={_.chain(parsedCDx)
              .map(cdx => ({
                label: cdx.biomarkerAssociation.drugs,
                value: cdx.biomarkerAssociation.drugs,
              }))
              .uniqBy('label')
              .sortBy('label')
              .value()}
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
            options={_.chain(
              parsedCDx.map(cdx => ({
                label: cdx.name,
                value: cdx.name,
              }))
            )
              .uniqBy('label')
              .sortBy('label')
              .value()}
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
