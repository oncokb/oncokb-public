import React from 'react';
import {
  AvCheckbox,
  AvCheckboxGroup,
  AvField,
} from 'availity-reactstrap-validation';
import { Col, Row } from 'react-bootstrap';
import { LicenseType, ONCOKB_TM } from 'app/config/constants';
import { NOT_USED_IN_AI_MODELS } from 'app/config/constants/terms';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { LONG_TEXT_VAL } from 'app/shared/utils/FormValidationUtils';

export function supportsApiAccessRequest(licenseType?: LicenseType) {
  return (
    licenseType !== undefined &&
    [LicenseType.ACADEMIC, LicenseType.HOSPITAL].includes(licenseType)
  );
}

type ApiAccessSectionProps = {
  apiAccessRequested: boolean;
  apiAccessJustificationFieldName: string;
  licenseType?: LicenseType;
  onToggleApiAccess: () => void;
  requestApiAccessFieldName: string;
};

export default function ApiAccessSection({
  apiAccessRequested,
  apiAccessJustificationFieldName,
  licenseType,
  onToggleApiAccess,
  requestApiAccessFieldName,
}: ApiAccessSectionProps) {
  if (!supportsApiAccessRequest(licenseType)) {
    return null;
  }

  return (
    <Row className={getSectionClassName()}>
      <Col md="3">
        <h5>API Access</h5>
      </Col>
      <Col md="9">
        {licenseType === LicenseType.ACADEMIC && (
          <>
            <p>
              Would you like programmatic access to the {ONCOKB_TM} database via
              our API? API access allows a user to simultaneously annotate
              multiple tumor mutations with {ONCOKB_TM} data and provides a text
              file output. {ONCOKB_TM} API access may also enable the user to
              leverage {ONCOKB_TM} alongside other platform APIs.
            </p>
            <p>
              Should you request API access, you must provide a detailed
              description on how you plan to use {ONCOKB_TM} APIs. Additional
              time for user screening will be required to grant access.
            </p>
            <p>
              The following use cases do <b>not</b> require API access:
            </p>
            <ul style={{ listStyleType: 'circle' }}>
              <li>Browse {ONCOKB_TM} content on our website</li>
              <li>
                Download data from our website (Actionable Genes, Precision
                Oncology Therapies, Cancer Genes etc.)
              </li>
              <li>
                View therapeutic implication descriptions (treatment
                descriptions)
              </li>
            </ul>
          </>
        )}
        {licenseType === LicenseType.HOSPITAL && (
          <>
            <p>
              Would you like programmatic access to {ONCOKB_TM} via our API for
              clinical reporting workflows? API access allows your team to
              annotate multiple tumor alterations at once and integrate{' '}
              {ONCOKB_TM} content into reporting pipelines instead of reviewing
              cases page by page on the website.
            </p>
            <p>
              Hospitals generally request API access when they need to support
              annotated clinical reporting, streamline variant interpretation,
              or reduce manual lookups across many cases.
            </p>
            <p>
              API access falls under a paid hospital license. If interested, we
              will contact you with licensing details shortly.
            </p>
          </>
        )}
        <AvCheckboxGroup
          name={requestApiAccessFieldName}
          key={requestApiAccessFieldName}
          errorMessage={'You have to accept the term'}
        >
          <AvCheckbox
            label={'Request API Access'}
            value={apiAccessRequested}
            onChange={onToggleApiAccess}
          />
        </AvCheckboxGroup>
        {apiAccessRequested && (
          <div className="mt-2">
            <b style={{ fontSize: '0.8rem', lineHeight: '1' }}>
              {NOT_USED_IN_AI_MODELS}
            </b>
            <AvField
              name={apiAccessJustificationFieldName}
              placeholder={
                'Provide a justification for your API access request'
              }
              rows={6}
              type={'textarea'}
              required={apiAccessRequested}
              validate={{
                ...LONG_TEXT_VAL,
                required: {
                  value: true,
                  errorMessage: 'Your justification is required.',
                },
              }}
            />
          </div>
        )}
      </Col>
    </Row>
  );
}
