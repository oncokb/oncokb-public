import { UPDATED_IMPLICATION_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import pluralize from 'pluralize';
import {
  convertGeneAndAlterationInputToLink,
  convertGeneInputToLinks,
  hasExclusionChars,
} from './Util';

export const UpdatedTxImplListItem = (props: {
  title?: string;
  data: SimpleTableRow[];
  numOfAssociationsInUpdatedImplication?: number;
}) => {
  const numOFAssociations = props.numOfAssociationsInUpdatedImplication
    ? props.numOfAssociationsInUpdatedImplication
    : props.data.length;
  const defaultTitle = `Updated therapeutic implications - ${numOFAssociations} new ${pluralize(
    'association',
    numOFAssociations
  )}`;

  const geneColumnIndex = 1;
  const mutationColumnIndex = 2;

  if (mutationColumnIndex > -1 && geneColumnIndex > -1) {
    // transform the gene and mutation input to a link, ignore the inputs with comma, pipe or slash
    props.data.forEach(row => {
      const geneInput = row.content[geneColumnIndex].content;
      const mutationInput = row.content[mutationColumnIndex].content;
      if (typeof geneInput === 'string' && typeof mutationInput === 'string') {
        if (
          !hasExclusionChars(mutationInput) &&
          !hasExclusionChars(geneInput)
        ) {
          row.content[
            mutationColumnIndex
          ].content = convertGeneAndAlterationInputToLink(
            geneInput,
            mutationInput
          );
        }
      }
    });
  }

  // transform the gene input to a link
  props.data.forEach(row => {
    const geneInput = row.content[geneColumnIndex].content;
    if (typeof geneInput === 'string') {
      row.content[geneColumnIndex].content = convertGeneInputToLinks(geneInput);
    }
  });

  return (
    <li>
      {props.title ? props.title : defaultTitle}
      <Row className={'overflow-auto'}>
        <SimpleTable columns={UPDATED_IMPLICATION_COLUMNS} rows={props.data} />
      </Row>
    </li>
  );
};
