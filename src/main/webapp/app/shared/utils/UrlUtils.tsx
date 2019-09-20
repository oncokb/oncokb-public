import { Link } from 'react-router-dom';
import React from 'react';

export const GenePageLink = (props: { hugoSymbol: string }) => {
  return <Link to={`/gene/${props.hugoSymbol}`}>{props.hugoSymbol}</Link>;
};

export const AlterationPageLink = (props: { hugoSymbol: string; alteration: string }) => {
  return <Link to={`/gene/${props.hugoSymbol}/${props.alteration}`}>{props.alteration}</Link>;
};
