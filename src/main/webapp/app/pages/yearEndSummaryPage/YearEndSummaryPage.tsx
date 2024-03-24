import * as React from 'react';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import DocumentTitle from 'react-document-title';
import {
  PAGE_ROUTE,
  PAGE_TITLE,
  YEAR_END_SUMMARY_DATE_FORMAT,
  YEAR_END_SUMMARY_TITLE_DATE_FORMAT,
} from 'app/config/constants';
import HashLink from 'app/shared/links/HashLink';
import moment from 'moment/moment';
import { BiomarkerTable } from 'app/pages/yearEndSummaryPage/BiomarkerTable';
import { DATA } from 'app/pages/yearEndSummaryPage/BiomarkerTableData';
import { getPageTitle, scrollWidthOffset } from 'app/shared/utils/Utils';
import { YEAR_END_SUMMARY_RANGE } from 'app/pages/newsPage/NewsPageNavTab';

const getTitle = (date: string) => {
  return moment(date, YEAR_END_SUMMARY_DATE_FORMAT).format(
    YEAR_END_SUMMARY_TITLE_DATE_FORMAT
  );
};

export const YearEndSummaryPage: React.FunctionComponent<{
  selectedYear?: string;
}> = props => {
  const [showAnchor, setShowAnchor] = useState(false);

  useEffect(() => {
    // let the element prints before scrolling
    setTimeout(() => {
      if (props.selectedYear) {
        const element = document.getElementById(props.selectedYear);
        scrollWidthOffset(element);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 200);
  }, [props.selectedYear]);

  return (
    <DocumentTitle
      title={getPageTitle(
        `${props.selectedYear ? `${props.selectedYear} ` : ''}${
          PAGE_TITLE.YEAR_END_SUMMARY
        }`
      )}
    >
      <div>
        <Row>
          <Col>
            <h4>Year End Summary</h4>
          </Col>
        </Row>
        {YEAR_END_SUMMARY_RANGE.map(year => (
          <Row key={`year-end-summary-row-${year}`}>
            <Col>
              <h5
                id={year}
                onMouseEnter={() => setShowAnchor(true)}
                onMouseLeave={() => setShowAnchor(false)}
              >
                {getTitle(year)}
                <HashLink
                  path={PAGE_ROUTE.YEAR_END_SUMMARY}
                  hash={year}
                  show={showAnchor}
                />
              </h5>
              <div className={'mb-3'}>
                <BiomarkerTable
                  tableKey={`biomarker-table-${year}`}
                  year={year}
                  data={DATA[year]}
                />
              </div>
            </Col>
          </Row>
        ))}
      </div>
    </DocumentTitle>
  );
};
