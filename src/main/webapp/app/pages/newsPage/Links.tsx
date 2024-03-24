import React from 'react';
import { Linkout } from 'app/shared/links/Linkout';

export const FdaApprovalLink: React.FunctionComponent<{
  link: string;
  approval: string;
  year?: string;
}> = props => {
  let linkText = 'FDA-approval ';
  if (props.year) {
    linkText += `(${props.year}) `;
  }
  linkText += `of ${props.approval}`;
  return <Linkout link={props.link}>{linkText}</Linkout>;
};
export const FdaWithdrawalLink: React.FunctionComponent<{
  linkText: string;
}> = props => {
  return (
    <Linkout link="https://www.fda.gov/drugs/resources-information-approved-drugs/withdrawn-cancer-accelerated-approvals">
      {props.linkText}
    </Linkout>
  );
};
export const FdaBreakthroughLink: React.FunctionComponent<{
  link: string;
}> = props => {
  return (
    <Linkout link={props.link}>FDA breakthrough therapy designation</Linkout>
  );
};
export const AbstractLink: React.FunctionComponent<{
  link: string;
  abstract: string;
}> = props => {
  return (
    <span>
      Abstract: <Linkout link={props.link}>{props.abstract}</Linkout>
    </span>
  );
};
export const NccnLink: React.FunctionComponent<{
  version: string;
  cancerType: string;
}> = props => {
  return (
    <span>
      Listing in {props.cancerType} NCCN {props.version}
    </span>
  );
};
