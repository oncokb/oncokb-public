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
  const excludedChars = [
    ',',
    '|',
    '/',
    'Oncogenic Ligand-Binding Domain Missense Mutations (310_547)',
    'Oncogenic Ligand-Binding Domain In-Frame Insertions or Deletions (310_547)',
  ];
  const geneInputHasExcludedChars = excludedChars.some(char =>
    geneInput.includes(char)
  );
  const mutationInputHasExcludedChars = excludedChars.some(char =>
    mutationInput.includes(char)
  );
  return !geneInputHasExcludedChars && !mutationInputHasExcludedChars;
};

export const getColumnIndexByName = (
  annotationColumnHeader: {
    name: string;
  }[],
  columnName: string
): number => {
  return annotationColumnHeader.findIndex(column => column.name === columnName);
};
