import React from 'react';
import { ElementType } from 'app/components/SimpleTable';
import { GenePageLink } from 'app/shared/utils/UrlUtils';
import WithSeparator from 'react-with-separator';

export const convertGeneInputToLinks = (geneInput: string): ElementType => {
  geneInput = geneInput.trim();
  const tokens = geneInput.split(',');
  if (tokens.length === 1) {
    return <GenePageLink hugoSymbol={geneInput} />;
  }

  const itemLinks = tokens.map(token => {
    token = token.trim();
    return <GenePageLink hugoSymbol={token} />;
  });

  return <WithSeparator separator=", ">{itemLinks}</WithSeparator>;
};

export const getColumnIndexByName = (
  annotationColumnHeader: {
    name: string;
  }[],
  columnName: string
): number => {
  return annotationColumnHeader.findIndex(column => column.name === columnName);
};
