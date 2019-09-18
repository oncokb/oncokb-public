import { Link } from 'react-router-dom';
import React from 'react';

export const GeneLink = (props: { hugoSymbol: string }) => {
  return <Link to={`/gene/${props.hugoSymbol}`}>{props.hugoSymbol}</Link>;
};
