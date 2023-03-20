import { UPDATED_IMPLICATION_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import pluralize from 'pluralize';
import { convertGeneInputToLinks } from './Util';

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
