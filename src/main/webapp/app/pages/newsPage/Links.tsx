import React from 'react';
import { Linkout } from 'app/shared/links/Linkout';

export const FdaApprovalLink: React.FunctionComponent<{
  link: string;
  approval: string;
}> = props => {
  return <Linkout link={props.link}>FDA-approval of {props.approval}</Linkout>;
};
export const AbstractLink: React.FunctionComponent<{
  link: string;
  abstract: string;
}> = props => {
  return (
    <span>
      Abstract:{' '}
      <Linkout
        link={'https://ascopubs.org/doi/abs/10.1200/JCO.2019.37.15_suppl.1000'}
      >
        {props.abstract}
      </Linkout>
    </span>
  );
};
