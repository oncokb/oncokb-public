import React from 'react';

export const PMALink: React.FunctionComponent<{ pma: string }> = props => {
  return (
    <span>
      <a
        href={`https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=${props.pma}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ whiteSpace: 'nowrap' }}
      >
        {props.pma}
      </a>
    </span>
  );
};
