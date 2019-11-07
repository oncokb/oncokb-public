import React from 'react';
import { PAGE_ROUTE } from 'app/config/constants';
import { Link } from 'react-router-dom';

const LicenseExplanation: React.FunctionComponent = () => {
  return (
    <span>
      A license is required to use OncoKB for commercial and/or clinical
      purposes. Fees will be used to support future development and maintenance
      of OncoKB. OncoKB is accessible for no fee for research use in academic
      setting.
    </span>
  );
};

export default LicenseExplanation;
