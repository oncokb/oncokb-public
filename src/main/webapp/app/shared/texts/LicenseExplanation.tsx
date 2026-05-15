import React from 'react';
import { ONCOKB_TM, PAGE_ROUTE } from 'app/config/constants';
import { Link } from 'react-router-dom';

const LicenseExplanation: React.FunctionComponent = () => {
  return (
    <span>
      {ONCOKB_TM} is freely accessible for academic research use and for manual
      clinical reference through the {ONCOKB_TM} website. A paid license is
      required for commercial use or for programmatic/API-based use of{' '}
      {ONCOKB_TM} content, including integration into clinical reporting
      workflows.
    </span>
  );
};

export default LicenseExplanation;
