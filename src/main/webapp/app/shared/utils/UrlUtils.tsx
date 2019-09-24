import { Link } from 'react-router-dom';
import React from 'react';
import { PAGE_ROUTE } from 'app/config/constants';

export const GenePageLink: React.FunctionComponent<{ hugoSymbol: string; content?: string }> = props => {
  return <Link to={`${PAGE_ROUTE.GENE}/${props.hugoSymbol}`}>{props.content ? props.content : props.hugoSymbol}</Link>;
};

export const AlterationPageLink: React.FunctionComponent<{
  hugoSymbol: string;
  alteration: string;
  showGene?: boolean;
  content?: string;
}> = props => {
  return (
    <Link to={`${PAGE_ROUTE.GENE}/${props.hugoSymbol}/${props.alteration}`}>
      {props.content ? props.content : props.showGene ? `${props.hugoSymbol} ${props.alteration}` : props.alteration}
    </Link>
  );
};

export const MSILink: React.FunctionComponent<{}> = () => {
  return <AlterationPageLink hugoSymbol={'Other Biomarkers'} alteration={'MSI-H'} content={'microsatellite instability high (MSI-H)'} />;
};
