import React, { useEffect, useState } from 'react';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import poTxs from 'content/files/precisionOncologyTx/presitionOncologyTx.json';
import poTxsExcel from 'content/files/precisionOncologyTx/Classification_of_FDA-approved_precision_oncology_therapies.xlsx';
import { COMPONENT_PADDING, LG_TABLE_FIXED_HEIGHT } from 'app/config/constants';
import { filterByKeyword, toggleStrList } from 'app/shared/utils/Utils';
import { Accordion, Button, Col, OverlayTrigger, Row } from 'react-bootstrap';
import classnames from 'classnames';
import Select from 'react-select';
import _ from 'lodash';
import { Input } from 'reactstrap';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import './styles.scss';
import Tooltip from 'rc-tooltip';
import WithSeparator from 'react-with-separator';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { COLOR_GREY, COLOR_LIGHT_GREY } from 'app/config/theme';
import ShowHideText from 'app/shared/texts/ShowHideText';
import { CitationLink } from 'app/shared/utils/UrlUtils';

type PrecisionOncologyTherapy = {
  id: number;
  year: string;
  tx: string;
  biomarker: string;
  biomarkerDetection: string;
  drugClassification: string;
};
type SelectOption = {
  value: string;
  label: string;
};

enum DRUG_CLASSIFICATION {
  FIRST_IN_CLASS = 'First-in-class',
  MECHANISTICALLY_DISTINCT = 'Mechanistically-distinct',
  FOLLOW_ON = 'Follow-on',
  RESISTANCE = 'Resistance',
}

const sortAndUniqByValue = (
  txs: PrecisionOncologyTherapy[],
  key: keyof PrecisionOncologyTherapy
) => {
  return _.chain(
    txs.map((tx: PrecisionOncologyTherapy) => {
      return {
        value: tx[key],
        label: tx[key],
      };
    })
  )
    .uniqBy('value')
    .sortBy('value')
    .value();
};
const footnotes = {
  a:
    'The first year the drug received FDA-approval in any indication, irrespective of biomarker',
  b:
    'Includes pathognomonic and indication-specific biomarkers, that while not specifically listed in the Indications and Usage section of the FDA drug label, are targeted by the precision oncology drug (ex KIT D816 in systemic mastocytosis [avapritinib] and SMARCB1 deletion in epithelioid sarcoma [tazemetostat])',
  c:
    'If there is a corresponding FDA-approved companion diagnostic test for biomarker identification, this detection method is listed; if a DNA NGS-based detection method can be used to identify the biomarker, this is noted',
  d:
    'Only drugs with an FDA-specified biomarker that can be detected by an NGS-based (DNA) assay are classified',
  e:
    'Pembrolizumab in combination with lenvatinib is FDA-approved approved for endometrial cancer that is pMMR',
  '*':
    'The exact year of the drug’s first FDA-approval could not be determined due to absent or ambiguous data on FDA.gov website',
  addl1:
    'NGS, Next-generation sequencing; ER, Estrogen Receptor; HR, Hormone Receptor; MSI-H, Microsatellite instability-high; HRR, Homologous Recombination Repair; TMB-H, Tumor mutational burden-high; dMMR, mismatch repair deficient; pMMR, mismatch repair proficient; PMSA, prostate-specific membrane antigen',
  addl2:
    'First-in class = 33; Mechanistically-distinct = 7; Follow-on = 19; Resistance = 10',
};

const DefinitionTooltip: React.FunctionComponent<{
  footnoteKey: keyof typeof footnotes;
}> = props => {
  return (
    <InfoIcon
      className={'ml-2'}
      overlay={<span>{footnotes[props.footnoteKey]}</span>}
    />
  );
};
const PrecisionOncologyTherapiesPage: React.FunctionComponent<{}> = props => {
  const [showDefinition, setShowDefinition] = useState(false);
  const [hasFilter, setHasFilter] = useState(false);
  const [biomarkerSearch, setBiomarkerSearch] = useState('');
  const [therapySearch, setTherapySearch] = useState('');
  const [
    selectedDetectionMethod,
    setSelectedDetectionMethod,
  ] = useState<SelectOption | null>(null);
  const [
    selectedDrugClassifications,
    setSelectedDrugClassifications,
  ] = useState<string[]>([]);
  const [filteredPoTxs, setFilteredPoTxs] = useState<
    PrecisionOncologyTherapy[]
  >(poTxs);
  const [drugClassificationStats, setDrugClassificationStats] = useState<{
    [key: string]: PrecisionOncologyTherapy[];
  }>({});

  useEffect(() => {
    if (
      biomarkerSearch ||
      therapySearch ||
      selectedDetectionMethod ||
      selectedDrugClassifications.length > 0
    ) {
      setHasFilter(true);
    } else {
      setHasFilter(false);
    }
    setFilteredPoTxs([
      ...poTxs.filter((tx: PrecisionOncologyTherapy) => {
        if (
          selectedDetectionMethod &&
          selectedDetectionMethod.value !== tx.biomarkerDetection
        ) {
          return false;
        }
        if (
          selectedDrugClassifications.length > 0 &&
          !selectedDrugClassifications.includes(tx.drugClassification)
        ) {
          return false;
        }
        if (
          therapySearch &&
          tx.tx &&
          !tx.tx.toLowerCase().includes(therapySearch.toLowerCase())
        ) {
          return false;
        }
        if (
          biomarkerSearch &&
          tx.biomarker &&
          !tx.biomarker.toLowerCase().includes(biomarkerSearch.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    ]);
  }, [
    biomarkerSearch,
    therapySearch,
    selectedDetectionMethod,
    selectedDrugClassifications.length,
  ]);

  useEffect(() => {
    setDrugClassificationStats(
      _.groupBy(filteredPoTxs, tx => tx.drugClassification)
    );
  }, [filteredPoTxs]);

  const onToggleDrugClassificationSelection = (classification: string) => {
    setSelectedDrugClassifications([
      ...toggleStrList(classification, selectedDrugClassifications),
    ]);
  };

  const clearFilters = () => {
    setBiomarkerSearch('');
    setTherapySearch('');
    setSelectedDetectionMethod(null);
    setSelectedDrugClassifications([]);
  };

  const columns: SearchColumn<PrecisionOncologyTherapy>[] = [
    {
      accessor: 'year',
      Header: (
        <span>
          Year of drug’s first FDA-approval
          <DefinitionTooltip footnoteKey={'a'} />
        </span>
      ),
      Cell(tableProps: { original: PrecisionOncologyTherapy }) {
        if (tableProps.original.year.endsWith('*')) {
          return (
            <span>
              {tableProps.original.year.slice(
                0,
                tableProps.original.year.length - 1
              )}
              <DefinitionTooltip footnoteKey={'*'} />
            </span>
          );
        } else {
          return tableProps.original.year;
        }
      },
      sortMethod(
        a: PrecisionOncologyTherapy,
        b: PrecisionOncologyTherapy
      ): number {
        return a.id - b.id;
      },
      onFilter: (data: PrecisionOncologyTherapy, keyword) =>
        filterByKeyword(data.year, keyword),
    },
    {
      accessor: 'tx',
      Header: <span>Precision oncology therapy</span>,
      onFilter: (data: PrecisionOncologyTherapy, keyword) =>
        filterByKeyword(data.tx, keyword),
    },
    {
      accessor: 'biomarker',
      Header: (
        <span>
          FDA-recognized biomarker(s)
          <DefinitionTooltip footnoteKey={'b'} />
        </span>
      ),
      Cell(tableProps: { original: PrecisionOncologyTherapy }) {
        if (tableProps.original.biomarker === 'pMMR') {
          return (
            <span>
              pMMR
              <DefinitionTooltip footnoteKey={'e'} />
            </span>
          );
        } else {
          return tableProps.original.biomarker;
        }
      },
      onFilter: (data: PrecisionOncologyTherapy, keyword) =>
        filterByKeyword(data.biomarker, keyword),
    },
    {
      accessor: 'biomarkerDetection',
      Header: (
        <span>
          Method of biomarker detection
          <DefinitionTooltip footnoteKey={'c'} />
        </span>
      ),
      onFilter: (data: PrecisionOncologyTherapy, keyword) =>
        filterByKeyword(data.biomarkerDetection, keyword),
    },
    {
      accessor: 'drugClassification',
      Header: (
        <span>
          Drug classification
          <DefinitionTooltip footnoteKey={'d'} />
        </span>
      ),
      onFilter: (data: PrecisionOncologyTherapy, keyword) =>
        filterByKeyword(data.drugClassification, keyword),
    },
  ];

  return (
    <>
      <Row>
        <Col>
          <h2 className={'mb-3'}>FDA-approved Precision Oncology Therapies</h2>
          <p>
            [BRIEF INTRO]
            <ShowHideText
              show={showDefinition}
              title={'definitions'}
              content={
                <ol type={'a'}>
                  <li>
                    <b>Precision oncology therapy</b>: A drug that is most
                    effective in a molecularly defined subset of patients and
                    for which pre-treatment molecular profiling is required for
                    optimal patient selection
                  </li>
                  <li>
                    <b>First-in-class precision oncology therapy</b>: A
                    precision oncology therapy targeting an alteration
                    previously classified as not actionable
                  </li>
                  <li>
                    <b>Mechanistically-distinct precision oncology therapy</b>:
                    A precision oncology therapy targeting a previously
                    actionable genomic alteration via a distinct
                    mechanisms-of-action, or with significantly different
                    selectivity versus older drugs
                  </li>
                  <li>
                    <b>Follow-on precision oncology therapy</b>: A precision
                    oncology therapy with a mechanism of action largely similar
                    to a previously FDA-approved drug
                  </li>
                  <li>
                    <b>Resistance precision oncology therapy</b>: A precision
                    oncology therapy with a mechanism of action largely similar
                    to a previously FDA-approved drug, but specifically designed
                    to target a molecularly acquired resistance mechanism that
                    emerged during previous drug treatment
                  </li>
                </ol>
              }
              onClick={() => setShowDefinition(!showDefinition)}
            />
          </p>
        </Col>
      </Row>
      <Row
        style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        className={'mb-2'}
      >
        <Col className={classnames(...COMPONENT_PADDING)} lg={4} md={6} xs={12}>
          <Input
            style={{ height: '100%' }}
            placeholder={'Search Therapy'}
            value={therapySearch}
            onChange={event => setTherapySearch(event.target.value)}
          />
        </Col>
        <Col className={classnames(...COMPONENT_PADDING)} lg={4} md={6} xs={12}>
          <Input
            style={{ height: '100%' }}
            placeholder={'Search Biomarker'}
            value={biomarkerSearch}
            onChange={event => setBiomarkerSearch(event.target.value)}
          />
        </Col>
        <Col className={classnames(...COMPONENT_PADDING)} lg={4} md={6} xs={12}>
          <Select
            placeholder={'Select Detection Method'}
            options={sortAndUniqByValue(poTxs, 'biomarkerDetection')}
            isClearable={true}
            value={selectedDetectionMethod}
            onChange={(selectedOption: any) =>
              setSelectedDetectionMethod(selectedOption)
            }
          />
        </Col>
      </Row>
      <Row>
        <Col className={'d-flex justify-content-between'}>
          <div>
            <span>Drug Classifications:</span>
            {[
              DRUG_CLASSIFICATION.FIRST_IN_CLASS,
              DRUG_CLASSIFICATION.MECHANISTICALLY_DISTINCT,
              DRUG_CLASSIFICATION.FOLLOW_ON,
              DRUG_CLASSIFICATION.RESISTANCE,
            ].map(classification => (
              <Button
                variant={'outline-secondary'}
                onClick={() =>
                  onToggleDrugClassificationSelection(classification)
                }
                active={selectedDrugClassifications.includes(classification)}
                className={'ml-2'}
                style={{ borderColor: COLOR_LIGHT_GREY }}
              >
                {classification}
                <span
                  className={'ml-2 py-1 px-2'}
                  style={{
                    backgroundColor: 'grey',
                    borderRadius: '1rem',
                    color: 'white',
                  }}
                >
                  {drugClassificationStats[classification]
                    ? _.uniq(
                        drugClassificationStats[classification].map(
                          row => row.tx
                        )
                      ).length
                    : 0}
                </span>
              </Button>
            ))}
            {hasFilter ? (
              <Button
                variant="link"
                size={'sm'}
                style={{ whiteSpace: 'nowrap' }}
                onClick={clearFilters}
              >
                Reset filters
              </Button>
            ) : undefined}
          </div>
          <DownloadButton className={'ml-2'} href={poTxsExcel}>
            Download Table
          </DownloadButton>
        </Col>
      </Row>
      <Row>
        <Col className={'mt-2'}>
          <OncoKBTable
            className={'po-tx-table'}
            columns={columns}
            data={filteredPoTxs}
            pageSize={filteredPoTxs.length < 10 ? 10 : filteredPoTxs.length}
            disableSearch
            defaultSorted={[
              {
                id: 'year',
                desc: false,
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
export default PrecisionOncologyTherapiesPage;
