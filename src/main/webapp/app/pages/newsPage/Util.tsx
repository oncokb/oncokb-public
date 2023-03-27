import React from 'react';
import { ElementType } from 'app/components/SimpleTable';
import { AlterationPageLink, GenePageLink } from 'app/shared/utils/UrlUtils';
import WithSeparator from 'react-with-separator';

export const convertGeneInputToLinks = (geneInput: string): ElementType => {
  const itemLinks = geneInput
    .trim()
    .split(',')
    .map(token => <GenePageLink hugoSymbol={token.trim()} />);

  return <WithSeparator separator=", ">{itemLinks}</WithSeparator>;
};

export const convertGeneAndAlterationInputToLink = (
  geneInput: string,
  alterationInput: string
): ElementType => {
  geneInput = geneInput.trim();
  alterationInput = alterationInput.trim();
  return (
    <AlterationPageLink hugoSymbol={geneInput} alteration={alterationInput} />
  );
};

export const hasExcludedChars = (input: string): boolean => {
  const excludedChars = [',', '|', '/'];
  return excludedChars.some(char => input.includes(char));
};

export const getColumnIndexByName = (
  annotationColumnHeader: {
    name: string;
  }[],
  columnName: string
): number => {
  return annotationColumnHeader.findIndex(column => column.name === columnName);
};
