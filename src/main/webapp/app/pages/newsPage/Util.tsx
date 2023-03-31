import React from 'react';
import { ElementType } from 'app/components/SimpleTable';
import { GenePageLink } from 'app/shared/utils/UrlUtils';
import WithSeparator from 'react-with-separator';

export const convertGeneInputToLinks = (geneInput: string): ElementType => {
  const itemLinks = geneInput
    .trim()
    .split(',')
    .map(token => <GenePageLink hugoSymbol={token.trim()} />);

  return <WithSeparator separator=", ">{itemLinks}</WithSeparator>;
};

export const linkableMutationName = (
  geneInput: string,
  mutationInput: string
): boolean => {
  const excludedChars = [',', '|', '/'];
  const geneInputHasExcludedChars = excludedChars.some(char =>
    geneInput.includes(char)
  );
  const mutationInputHasExcludedChars = excludedChars.some(char =>
    mutationInput.includes(char)
  );
  return (
    !geneInputHasExcludedChars &&
    !mutationInputHasExcludedChars &&
    geneInput !== 'ESR1'
  );
};

export const getColumnIndexByName = (
  annotationColumnHeader: {
    name: string;
  }[],
  columnName: string
): number => {
  return annotationColumnHeader.findIndex(column => column.name === columnName);
};
