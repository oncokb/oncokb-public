import React from 'react';
import { PAGE_ROUTE } from 'app/config/constants';
import { Link } from 'react-router-dom';

const LicenseExplanation: React.FunctionComponent = () => {
  return (
    <span>
      OncoKB data is freely accessible for research use in the academic setting.
      To support the future development and maintenance of OncoKB, we have
      introduced license fees for clinical and commercial use. See our{' '}
      <Link to={PAGE_ROUTE.TERMS}>usage terms</Link> for further information.
    </span>
  );
};

export default LicenseExplanation;
