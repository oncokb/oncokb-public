import React, { useEffect, useMemo, useState } from 'react';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import fdaTxs from 'content/files/oncologyTherapies/fda_approved_oncology_therapies.json';
import fdaTxsExcel from 'content/files/oncologyTherapies/fda_approved_oncology_therapies.xlsx';
import { LG_TABLE_FIXED_HEIGHT } from 'app/config/constants';
import { Button, ButtonProps, Col, FormCheck, Row } from 'react-bootstrap';
import _ from 'lodash';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import InfoIcon from 'app/shared/icons/InfoIcon';
import ShowHideText from 'app/shared/texts/ShowHideText';
import { Linkout } from 'app/shared/links/Linkout';
import styles from 'app/index.module.scss';
import { Input } from 'reactstrap';
import Select from 'react-select';
import pluralize from 'pluralize';

type FdaApprovedOncologyTherapy = {
  year: string;
  tx: string;
  biomarker: string;
  agentClass: string;
  drugTarget: string;
  targetedTx: string;
  pxTx: string;
  ngsTest: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type SelectionButtonProps = {
  title: string;
  subtitle: string;
  numTherapies: number;
} & ButtonProps;

enum STAT_CLASSIFICATION {
  TARGETED = 'Targeted therapy',
  PO = 'Precision oncology therapy',
  DETECT_NGS = 'Can a DNA/NGS-based method be used for biomarker detection?',
}

const HEADER_TOOLTIP_STYLE = {
  paddingLeft: 15,
  marginBottom: 0,
};

const SelectionButton: React.FunctionComponent<SelectionButtonProps> = props => {
  return (
    <Button
      {...props}
      variant="light"
      className={styles.actionButton}
      style={{ minHeight: 76, fontSize: '1rem' }}
    >
      <div>{props.subtitle}</div>
      <div>
        <b>{props.title}</b>
      </div>
      <div>
        {props.numTherapies} {pluralize('therapy', props.numTherapies)}
      </div>
    </Button>
  );
};

const sortAndUniqByValue = (
  txs: FdaApprovedOncologyTherapy[],
  key: keyof FdaApprovedOncologyTherapy,
  separators?: string[]
) => {
  return _.chain(txs)
    .reduce((acc, tx: FdaApprovedOncologyTherapy) => {
      const methods =
        (separators || []).length > 0
          ? tx[key]
              .split(new RegExp(`${separators?.join('|')}`))
              .map(method => method.trim())
          : [tx[key]];
      const options = methods
        .filter(method => !!method.trim())
        .map((method: string) => {
          return {
            value: method,
            label: method,
          };
        });
      acc.push(...options);
      return acc;
    }, [] as SelectOption[])
    .uniqBy('value')
    .sortBy('value')
    .value();
};

const footnotes = {
  classAgent: (
    <div>
      Drug classifications were made based on information in each drug's{' '}
      <Linkout
        link={'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm'}
      >
        FDA drug label
      </Linkout>{' '}
      and{' '}
      <Linkout
        link={'https://www.cancer.gov/publications/dictionaries/cancer-drug'}
      >
        NCI Drug Dictionary
      </Linkout>
      .
    </div>
  ),
  ngsTest: (
    <div>
      <ul style={HEADER_TOOLTIP_STYLE}>
        <li>
          Classification applies only to drugs labeled as Precision oncology
          therapies.
        </li>
        <li>
          If at least one of the listed biomarkers can be detected by
          DNA/NGS-based method, this column will be marked as Y.
        </li>
      </ul>
    </div>
  ),
  biomarker: (
    <div>
      <ul style={HEADER_TOOLTIP_STYLE}>
        <li>
          Includes pathognomonic and indication-specific biomarkers, that while
          not specifically listed in the Indications and Usage section of the
          FDA drug label, are targeted by the precision oncology drug (ex KIT
          D816 in systemic mastocytosis [avapritinib]).
        </li>
        <li>
          Bullets signify indication-specific FDA-recognized biomarker(s) for
          the listed therapy.
        </li>
      </ul>
    </div>
  ),
  abbreviation: (
    <div>
      <div>
        <b>NGS</b>: Next-generation sequencing
      </div>
      <div>
        <b>ER</b>: Estrogen receptor
      </div>
      <div>
        <b>HR</b>: Hormone receptor
      </div>
      <div>
        <b>MSI-H</b>: Microsatellite instability-high
      </div>
      <div>
        <b>HRR</b>: Homologous recombination repair
      </div>
      <div>
        <b>TMB-H</b>: Tumor mutational burden-high
      </div>
      <div>
        <b>dMMR</b>: Mismatch repair deficient
      </div>
      <div>
        <b>pMMR</b>: Mismatch repair proficient
      </div>
      <div>
        <b>PSMA</b>: Prostate-specific membrane antigen
      </div>
      <div>
        <b>ITD</b>: Internal tandem duplication
      </div>
      <div>
        <b>TKD</b>: Tyrosine kinase domain
      </div>
      <div>
        <b>Ph+</b>: Philadelphia chromosome +
      </div>
    </div>
  ),
  unclearYear:
    'The exact year of the drug’s first FDA-approval could not be determined due to absent or ambiguous data on FDA.gov website',
  fdaUnapproved: (
    <span>
      The drug is no longer FDA-approved according to{' '}
      <Linkout
        link={
          'www.fda.gov/drugs/resources-information-approved-drugs/withdrawn-cancer-accelerated-approvals'
        }
      >
        fda.gov
      </Linkout>
      .
    </span>
  ),
};

const DefinitionTooltip: React.FunctionComponent<{
  className?: string;
  footnoteKey: keyof typeof footnotes;
}> = props => {
  return (
    <InfoIcon
      className={props.className ? props.className : 'ml-2'}
      overlay={<span>{footnotes[props.footnoteKey]}</span>}
    />
  );
};
const OncologyTherapiesPage: React.FunctionComponent<{}> = props => {
  const [showDefinition, setShowDefinition] = useState(false);

  const [hasFilter, setHasFilter] = useState(false);
  const [poOnly, setPoOnly] = useState(true);
  const [targetedOnly, setTargetedOnly] = useState(false);
  const [biomarkerSearch, setBiomarkerSearch] = useState('');
  const [selectedTherapies, setSelectedTherapies] = useState<SelectOption[]>(
    []
  );
  const [selectedAgents, setSelectedAgents] = useState<SelectOption[]>([]);
  const [selectedDrugTargets, setSelectedTargets] = useState<SelectOption[]>(
    []
  );
  const [classificationStats, setClassificationStats] = useState<{
    [key: string]: number;
  }>({});

  const simplifyDrugTarget = (drugTarget: string) =>
    drugTarget.replace(/\(.*\)/, '').trim();
  const columns: SearchColumn<FdaApprovedOncologyTherapy>[] = [
    {
      accessor: 'year',
      Header: <span>Year of drug’s first FDA-approval</span>,
      Cell(tableProps: { original: FdaApprovedOncologyTherapy }) {
        if (tableProps.original.year.endsWith('*')) {
          return (
            <span>
              {tableProps.original.year.slice(
                0,
                tableProps.original.year.length - 1
              )}
              <DefinitionTooltip footnoteKey={'unclearYear'} />
            </span>
          );
        } else {
          return tableProps.original.year;
        }
      },
    },
    {
      accessor: 'tx',
      Header: <span>FDA-approved drug(s)</span>,
      Cell(tableProps: { original: FdaApprovedOncologyTherapy }) {
        if (tableProps.original.tx.endsWith('*')) {
          return (
            <span>
              {tableProps.original.tx.slice(
                0,
                tableProps.original.tx.length - 1
              )}
              <DefinitionTooltip footnoteKey={'fdaUnapproved'} />
            </span>
          );
        } else {
          return tableProps.original.tx;
        }
      },
    },
    {
      show: poOnly,
      sortable: false,
      Header: (
        <span>
          FDA drug label listed biomarker(s)
          <DefinitionTooltip footnoteKey={'biomarker'} />
        </span>
      ),
      Cell(cell: { original: FdaApprovedOncologyTherapy }) {
        if (cell.original.biomarker.includes('\n')) {
          return (
            <ul>
              {cell.original.biomarker.split('\n').map(item => (
                <li>{item}</li>
              ))}
            </ul>
          );
        } else {
          return <span>{cell.original.biomarker}</span>;
        }
      },
    },
    {
      accessor: 'agentClass',
      Header: (
        <span>
          Class of agent(s)
          <DefinitionTooltip footnoteKey={'classAgent'} />
        </span>
      ),
    },
    {
      accessor: 'drugTarget',
      Header: (
        <span>
          Mechanism of action or drug target
          <DefinitionTooltip footnoteKey={'classAgent'} />
        </span>
      ),
    },
    {
      accessor: 'targetedTx',
      width: 80,
      Header: <span>{STAT_CLASSIFICATION.TARGETED}</span>,
      Cell(tableProps: { original: FdaApprovedOncologyTherapy }) {
        return tableProps.original.targetedTx === 'Y' ? (
          <i className="fa fa-check" />
        ) : (
          ''
        );
      },
    },
    {
      accessor: 'pxTx',
      width: 90,
      Header: <span>{STAT_CLASSIFICATION.PO}</span>,
      Cell(tableProps: { original: FdaApprovedOncologyTherapy }) {
        return tableProps.original.pxTx === 'Y' ? (
          <i className="fa fa-check" />
        ) : (
          ''
        );
      },
    },
    {
      accessor: 'ngsTest',
      Header: (
        <span>
          {STAT_CLASSIFICATION.DETECT_NGS}{' '}
          <DefinitionTooltip footnoteKey={'ngsTest'} />
        </span>
      ),
    },
  ];

  const poTxs = useMemo(() => {
    return fdaTxs.filter((tx: FdaApprovedOncologyTherapy) => {
      return tx.pxTx === 'Y';
    });
  }, [poOnly]);
  const targetedTxs = useMemo(() => {
    return fdaTxs.filter((tx: FdaApprovedOncologyTherapy) => {
      return tx.targetedTx === 'Y';
    });
  }, [poOnly]);
  const txs = useMemo(() => {
    if (poOnly) {
      return poTxs;
    } else if (targetedOnly) {
      return targetedTxs;
    } else {
      return fdaTxs;
    }
  }, [fdaTxs, poOnly, targetedOnly]);
  const drugTargetOptions: SelectOption[] = useMemo(() => {
    return _.uniq(
      txs.map((tx: FdaApprovedOncologyTherapy) =>
        simplifyDrugTarget(tx.drugTarget)
      )
    )
      .sort()
      .map((tx: string) => {
        return {
          value: tx,
          label: tx,
        };
      });
  }, [txs]);

  const filteredTxs: FdaApprovedOncologyTherapy[] = useMemo(() => {
    return txs.filter((tx: FdaApprovedOncologyTherapy) => {
      if (
        selectedTherapies.length > 0 &&
        selectedTherapies.filter(selectedTx => tx.tx === selectedTx.value)
          .length === 0
      ) {
        return false;
      }
      if (
        selectedAgents.length > 0 &&
        selectedAgents.filter(agentClass => tx.agentClass === agentClass.value)
          .length === 0
      ) {
        return false;
      }
      if (
        selectedDrugTargets.length > 0 &&
        selectedDrugTargets.filter(
          drugTarget => simplifyDrugTarget(tx.drugTarget) === drugTarget.value
        ).length === 0
      ) {
        return false;
      }
      if (
        biomarkerSearch &&
        (!tx.biomarker ||
          !tx.biomarker.toLowerCase().includes(biomarkerSearch.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });
  }, [
    txs,
    selectedTherapies,
    selectedAgents,
    selectedDrugTargets,
    biomarkerSearch,
  ]);

  useEffect(() => {
    setHasFilter(
      !!biomarkerSearch ||
        selectedTherapies.length > 0 ||
        selectedAgents.length > 0 ||
        selectedDrugTargets.length > 0
    );
  }, [selectedTherapies, selectedAgents, selectedDrugTargets, biomarkerSearch]);
  useEffect(() => {
    const stats = {
      [STAT_CLASSIFICATION.TARGETED]: 0,
      [STAT_CLASSIFICATION.PO]: 0,
      [STAT_CLASSIFICATION.DETECT_NGS]: 0,
    };
    filteredTxs.forEach(tx => {
      if (tx.targetedTx === 'Y') {
        stats[STAT_CLASSIFICATION.TARGETED]++;
      }
      if (tx.pxTx === 'Y') {
        stats[STAT_CLASSIFICATION.PO]++;
      }
      if (tx.ngsTest === 'Y') {
        stats[STAT_CLASSIFICATION.DETECT_NGS]++;
      }
    });
    setClassificationStats(stats);
  }, [filteredTxs]);

  const numFilteredTxs = useMemo(() => {
    return _.uniq(filteredTxs.map((tx: FdaApprovedOncologyTherapy) => tx.tx))
      .length;
  }, [filteredTxs]);
  const clearFilters = () => {
    setBiomarkerSearch('');
    setTargetedOnly(false);
    setSelectedTherapies([]);
    setSelectedTargets([]);
    setSelectedAgents([]);
  };

  return (
    <>
      <Row>
        <Col>
          <h2 className={'mb-3'}>FDA-Approved Oncology Therapies</h2>
          <div className={'mb-2'}>
            <Linkout
              link={
                'https://www.fda.gov/drugs/resources-information-approved-drugs/oncology-cancer-hematologic-malignancies-approval-notifications'
              }
            >
              Content current as of 4/23/2024
            </Linkout>
          </div>
          <div>
            The following US Food and Drug Administration (FDA)-approved
            oncology drugs post June 1998 are categorized by drug class and
            mechanism of action. Each drug is further classified as to whether
            it qualifies as a targeted therapy or precision oncology therapy
            based on{' '}
            <Linkout link="https://aacrjournals.org/cancerdiscovery/article/doi/10.1158/2159-8290.CD-23-0467/729589/Quantifying-the-Expanding-Landscape-of-Clinical">
              Suehnholz et al., Cancer Discovery 2023
            </Linkout>{' '}
            (definitions below).
          </div>
          <ShowHideText
            className={'my-2'}
            show={showDefinition}
            title={'definitions'}
            content={
              <ol type={'a'}>
                <li>
                  <b>Oncology drug</b>: A drug approved by the US-Food and Drug
                  Administration (FDA) for the treatment of cancer
                </li>
                <li>
                  <b>Targeted therapy</b>: A cancer drug that binds to or
                  inhibits a specific protein target
                </li>
                <li>
                  <b>Precision oncology therapy</b>: A drug that is most
                  effective in a molecularly defined subset of patients and for
                  which pre-treatment molecular profiling is required for
                  optimal patient selection
                </li>
              </ol>
            }
            onClick={() => setShowDefinition(!showDefinition)}
          />
        </Col>
      </Row>
      <div className={'my-2'}>
        <Row>
          <Col md={4} xs={12} className={'mb-2'}>
            <SelectionButton
              onClick={() => {
                setPoOnly(true);
                setTargetedOnly(false);
              }}
              active={poOnly}
              title={'Precision Oncology Therapies'}
              subtitle={'FDA-Approved'}
              numTherapies={poTxs.length}
            />
          </Col>
          <Col md={4} xs={12} className={'mb-2'}>
            <SelectionButton
              onClick={() => {
                setPoOnly(false);
                setTargetedOnly(true);
              }}
              active={targetedOnly}
              title={'Targeted Therapies'}
              subtitle={'FDA-Approved'}
              numTherapies={targetedTxs.length}
            />
          </Col>
          <Col md={4} xs={12} className={'mb-2'}>
            <SelectionButton
              onClick={() => {
                setPoOnly(false);
                setTargetedOnly(false);
              }}
              active={!poOnly && !targetedOnly}
              title={'Oncology Therapies'}
              subtitle={'FDA-Approved'}
              numTherapies={fdaTxs.length}
            />
          </Col>
        </Row>
        <Row className={'mt-2'}>
          <Col lg={poOnly ? 3 : 4} md={6} xs={12} className={'mb-2'}>
            <Select
              placeholder={'Select drug(s)'}
              options={sortAndUniqByValue(txs, 'tx', [])}
              isClearable={true}
              value={selectedTherapies}
              isMulti
              closeMenuOnSelect={false}
              onChange={(selectedOptions: any[]) => {
                setSelectedTherapies(selectedOptions || []);
              }}
            />
          </Col>
          <Col lg={poOnly ? 3 : 4} md={6} xs={12} className={'mb-2'}>
            <Select
              placeholder={'Select class of agent(s)'}
              options={sortAndUniqByValue(txs, 'agentClass', [])}
              isClearable={true}
              value={selectedAgents}
              isMulti
              closeMenuOnSelect={false}
              onChange={(selectedOptions: any[]) => {
                setSelectedAgents(selectedOptions || []);
              }}
            />
          </Col>
          <Col lg={poOnly ? 3 : 4} md={6} xs={12} className={'mb-2'}>
            <Select
              placeholder={'Select mechanism of action'}
              options={drugTargetOptions}
              isClearable={true}
              value={selectedDrugTargets}
              isMulti
              closeMenuOnSelect={false}
              onChange={(selectedOptions: any[]) => {
                setSelectedTargets(selectedOptions || []);
              }}
            />
          </Col>
          {poOnly && (
            <Col lg={3} md={6} xs={12} className={'mb-2'}>
              <Input
                style={{ height: 38 }}
                placeholder={'Search biomarker'}
                value={biomarkerSearch}
                onChange={event => setBiomarkerSearch(event.target.value)}
              />
            </Col>
          )}
        </Row>
      </div>
      <Row>
        <Col className={'d-flex justify-content-between align-items-center'}>
          <div>
            <b>
              Showing {numFilteredTxs} {pluralize('therapy', numFilteredTxs)}
            </b>
            : ({classificationStats[STAT_CLASSIFICATION.TARGETED]} Targeted{' '}
            {pluralize(
              'therapy',
              classificationStats[STAT_CLASSIFICATION.TARGETED]
            )}
            , {classificationStats[STAT_CLASSIFICATION.PO]} Precision oncology{' '}
            {pluralize(
              'therapy',
              classificationStats[STAT_CLASSIFICATION.TARGETED]
            )}
            , {classificationStats[STAT_CLASSIFICATION.DETECT_NGS]}{' '}
            {pluralize(
              'therapy',
              classificationStats[STAT_CLASSIFICATION.TARGETED]
            )}{' '}
            with a biomarker that can be identified by a DNA/NGS-based detection
            method)
            <DefinitionTooltip
              footnoteKey={'abbreviation'}
              className={'mx-1'}
            />
            {hasFilter ? (
              <Button
                variant="outline-primary"
                className={'ml-2'}
                style={{ whiteSpace: 'nowrap' }}
                onClick={clearFilters}
                size={'sm'}
              >
                <span className={'fa fa-times mr-1'}></span>
                Reset filters
              </Button>
            ) : undefined}
          </div>
          <DownloadButton
            className={'ml-2'}
            href={fdaTxsExcel}
            size={'sm'}
            outline
          >
            Download Table
          </DownloadButton>
        </Col>
      </Row>
      <Row>
        <Col className={'mt-2'}>
          <OncoKBTable
            className={'po-tx-table'}
            columns={columns}
            data={filteredTxs}
            pageSize={filteredTxs.length < 10 ? 10 : filteredTxs.length}
            disableSearch
            defaultSorted={[
              {
                id: 'year',
                desc: true,
              },
            ]}
            style={{
              height: LG_TABLE_FIXED_HEIGHT,
            }}
          />
        </Col>
      </Row>
    </>
  );
};
export default OncologyTherapiesPage;
