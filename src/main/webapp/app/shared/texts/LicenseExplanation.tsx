import React from 'react';
import { ONCOKB_TM, PAGE_ROUTE } from 'app/config/constants';
import { Link } from 'react-router-dom';

const LicenseExplanation: React.FunctionComponent = () => {
  return (
    <span>
      A license is required to use {ONCOKB_TM} in a commercial setting or for
      clinical purposes. {ONCOKB_TM} is freely accessible for research use in an
      academic setting.
    </span>
  );
};

export default LicenseExplanation;
