import React, { useEffect, useState } from 'react';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import poTxs from 'content/files/precisionOncologyTx/presitionOncologyTx.json';
import poTxsExcel from 'content/files/precisionOncologyTx/Classification_of_FDA-approved_precision_oncology_therapies.xlsx';
import { COMPONENT_PADDING, LG_TABLE_FIXED_HEIGHT } from 'app/config/constants';
import { filterByKeyword } from 'app/shared/utils/Utils';
import { Accordion, Button, Col, OverlayTrigger, Row } from 'react-bootstrap';
import classnames from 'classnames';
import Select from 'react-select';
import _ from 'lodash';
import { Input } from 'reactstrap';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import './styles.scss';
import Tooltip from 'rc-tooltip';

type PrecisionOncologyTx = {
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
const sortAndUniqByValue = (
  txs: PrecisionOncologyTx[],
  key: keyof PrecisionOncologyTx
) => {
  return _.chain(
    txs.map((tx: PrecisionOncologyTx) => {
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
    'Includes pathogeomonic and indication-specific biomarkers, that while not specifically listed in the Indications and Usage section of the FDA drug label, are targeted by the precision oncology drug (ex KIT D816 in systemic mastocytosis [avapritinib] and SMARCB1 deletion in epithelioid sarcoma [tazemetostat])',
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

const FootNoteTooltip: React.FunctionComponent<{
  footnoteKey: keyof typeof footnotes;
}> = props => {
  return (
    <Tooltip
      placement="top"
      trigger={['hover']}
      overlay={<span>{footnotes[props.footnoteKey]}</span>}
    >
      <span className={props.footnoteKey === '*' ? '' : 'footnote-letter'}>
        {props.footnoteKey}
      </span>
    </Tooltip>
  );
};
const PrecisionOncologyTxPage: React.FunctionComponent<{}> = props => {
  const [hasFilter, setHasFilter] = useState(false);
  const [biomarkerSearch, setBiomarkerSearch] = useState('');
  const [
    selectedPoTherapy,
    setSelectedPoTherapy,
  ] = useState<SelectOption | null>(null);
  const [
    selectedDetectionMethod,
    setSelectedDetectionMethod,
  ] = useState<SelectOption | null>(null);
  const [
    selectedDrugClassification,
    setSelectedDrugClassification,
  ] = useState<SelectOption | null>(null);
  const [filteredPoTxs, setFilteredPoTxs] = useState<PrecisionOncologyTx[]>(
    poTxs
  );

  useEffect(() => {
    if (
      biomarkerSearch ||
      selectedPoTherapy ||
      selectedDetectionMethod ||
      selectedDrugClassification
    ) {
      setHasFilter(true);
    } else {
      setHasFilter(false);
    }
    setFilteredPoTxs([
      ...poTxs.filter((tx: PrecisionOncologyTx) => {
        if (selectedPoTherapy && selectedPoTherapy.value !== tx.tx) {
          return false;
        }
        if (
          selectedDetectionMethod &&
          selectedDetectionMethod.value !== tx.biomarkerDetection
        ) {
          return false;
        }
        if (
          selectedDrugClassification &&
          selectedDrugClassification.value !== tx.drugClassification
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
    selectedPoTherapy,
    selectedDetectionMethod,
    selectedDrugClassification,
  ]);

  const clearFilters = () => {
    setBiomarkerSearch('');
    setSelectedPoTherapy(null);
    setSelectedDetectionMethod(null);
    setSelectedDrugClassification(null);
  };

  const columns: SearchColumn<PrecisionOncologyTx>[] = [
    {
      accessor: 'year',
      Header: (
        <span>
          Year of drug’s first FDA-approval
          <FootNoteTooltip footnoteKey={'a'} />
        </span>
      ),
      Cell(tableProps: { original: PrecisionOncologyTx }) {
        if (tableProps.original.year.endsWith('*')) {
          return (
            <span>
              {tableProps.original.year.slice(
                0,
                tableProps.original.year.length - 1
              )}
              <FootNoteTooltip footnoteKey={'*'} />
            </span>
          );
        } else {
          return tableProps.original.year;
        }
      },
      sortMethod(a: PrecisionOncologyTx, b: PrecisionOncologyTx): number {
        return a.id - b.id;
      },
      onFilter: (data: PrecisionOncologyTx, keyword) =>
        filterByKeyword(data.year, keyword),
    },
    {
      accessor: 'tx',
      Header: (
        <span>
          Precision oncology therapy
          <br />
          N=86
        </span>
      ),
      onFilter: (data: PrecisionOncologyTx, keyword) =>
        filterByKeyword(data.tx, keyword),
    },
    {
      accessor: 'biomarker',
      Header: (
        <span>
          FDA-recognized biomarker(s)
          <FootNoteTooltip footnoteKey={'b'} />
        </span>
      ),
      Cell(tableProps: { original: PrecisionOncologyTx }) {
        if (tableProps.original.biomarker === 'pMMR') {
          return (
            <span>
              pMMR
              <FootNoteTooltip footnoteKey={'e'} />
            </span>
          );
        } else {
          return tableProps.original.biomarker;
        }
      },
      onFilter: (data: PrecisionOncologyTx, keyword) =>
        filterByKeyword(data.biomarker, keyword),
    },
    {
      accessor: 'biomarkerDetection',
      Header: (
        <span>
          Method of biomarker detection
          <FootNoteTooltip footnoteKey={'c'} />
        </span>
      ),
      onFilter: (data: PrecisionOncologyTx, keyword) =>
        filterByKeyword(data.biomarkerDetection, keyword),
    },
    {
      accessor: 'drugClassification',
      Header: (
        <span>
          Drug classification
          <FootNoteTooltip footnoteKey={'d'} />
        </span>
      ),
      onFilter: (data: PrecisionOncologyTx, keyword) =>
        filterByKeyword(data.drugClassification, keyword),
    },
  ];

  return (
    <>
      <Row>
        <Col>
          <h2 className={'mb-3'}>
            Classification of Precision Oncology Therapies FDA-approved
            <br />
            between 1998 - present
          </h2>
        </Col>
      </Row>
      <Row
        style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
        className={'mb-2'}
      >
        <Col className={classnames(...COMPONENT_PADDING)} lg={3} md={6} xs={12}>
          <Select
            placeholder={'Select PO Therapy'}
            options={sortAndUniqByValue(poTxs, 'tx')}
            isClearable={true}
            value={selectedPoTherapy}
            onChange={(selectedOption: any) =>
              setSelectedPoTherapy(selectedOption)
            }
          />
        </Col>
        <Col className={classnames(...COMPONENT_PADDING)} lg={3} md={6} xs={12}>
          <Input
            placeholder={'Search Biomarker'}
            value={biomarkerSearch}
            onChange={event => setBiomarkerSearch(event.target.value)}
          />
        </Col>
        <Col className={classnames(...COMPONENT_PADDING)} lg={3} md={6} xs={12}>
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
        <Col className={classnames(...COMPONENT_PADDING)} lg={3} md={6} xs={12}>
          <Select
            placeholder={'Select Drug Classification'}
            options={sortAndUniqByValue(poTxs, 'drugClassification')}
            isClearable={true}
            value={selectedDrugClassification}
            onChange={(selectedOption: any) =>
              setSelectedDrugClassification(selectedOption)
            }
          />
        </Col>
      </Row>
      <Row>
        <Col className={'d-flex justify-content-between'}>
          <span>
            <b>{`Showing ${filteredPoTxs.length} classifications`}</b>
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
          </span>
          <DownloadButton className={'ml-2'} size={'sm'} href={poTxsExcel}>
            Classifications
          </DownloadButton>
        </Col>
      </Row>
      <Row>
        <Col className={'mt-2'}>
          <OncoKBTable
            className={'po-tx-table'}
            columns={columns}
            data={filteredPoTxs}
            pageSize={filteredPoTxs.length}
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
          <div className={'definition-notes mt-2'}>
            {['a', 'b', 'c', 'd', 'e', '*', 'addl1', 'addl2'].map(
              footnoteKey => (
                <div key={footnoteKey} className={'note'}>
                  {!footnoteKey.startsWith('addl') && (
                    <span className={'note-letter'}>{footnoteKey}</span>
                  )}
                  <span>{footnotes[footnoteKey]}</span>
                </div>
              )
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};
export default PrecisionOncologyTxPage;
