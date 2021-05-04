import React from 'react';
import { PAGE_ROUTE } from 'app/config/constants';
import { Link } from 'react-router-dom';

const LicenseExplanation: React.FunctionComponent = () => {
  return (
    <span>
      A license is required to use OncoKB in a commercial setting or for
      clinical purposes. OncoKB is freely accessible for research use in an
      academic setting.
    </span>
  );
};

export default LicenseExplanation;
