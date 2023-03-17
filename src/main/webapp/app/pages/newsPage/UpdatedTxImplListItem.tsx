import { UPDATED_IMPLICATION_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import pluralize from 'pluralize';
import { GenePageLink } from 'app/shared/utils/UrlUtils';

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

  // Its always one?, where zero column is level, then gene?
  const geneColumnIndex = 1;
  // transform the gene input to a link
  props.data.forEach(row => {
    const geneInput = row.content[geneColumnIndex].content;
    if (typeof geneInput === 'string') {
      const tokens = geneInput.split(',');
      if (tokens.length > 1) {
        const itemLinks = tokens.map((token, i) => {
          token = token.trim();
          if (i === tokens.length - 1) {
            return <GenePageLink hugoSymbol={token} />;
          }
          return (
            <>
              <GenePageLink hugoSymbol={token} />
              {', '}
            </>
          );
        });
        row.content[geneColumnIndex].content = itemLinks;
      } else {
        row.content[geneColumnIndex].content = (
          <GenePageLink hugoSymbol={geneInput} />
        );
      }
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
