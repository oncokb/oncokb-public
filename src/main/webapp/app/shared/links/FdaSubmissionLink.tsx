import React from 'react';
import { getFdaSubmissionNumber, toAppLocalDateFormat } from '../utils/Utils';
import { FDA_SUBMISSION_URL_SUFFIX } from 'app/config/constants';
import { Linkout } from './Linkout';
import { IFdaSubmission } from 'app/pages/companionDiagnosticDevicesPage/companionDiagnosticDevicePage';

const FDA_SUBMISSION_BASE_URL =
  'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/';

export const FdaSubmissionLink: React.FunctionComponent<{
  fdaSubmission: IFdaSubmission;
}> = props => {
  const submissionNumber = getFdaSubmissionNumber(
    props.fdaSubmission.number,
    props.fdaSubmission.supplementNumber
  );
  const date = toAppLocalDateFormat(props.fdaSubmission.decisionDate);
  const link =
    FDA_SUBMISSION_BASE_URL +
    FDA_SUBMISSION_URL_SUFFIX[props.fdaSubmission.type.type] +
    '?id=' +
    submissionNumber.replace('/', '');
  return (
    <span>
      <Linkout link={link}>{submissionNumber}</Linkout> ({date})
    </span>
  );
};
