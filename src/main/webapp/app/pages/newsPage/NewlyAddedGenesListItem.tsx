import React from 'react';
import pluralize from 'pluralize';
import { Link } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';
import { GenePageLink } from 'app/shared/utils/UrlUtils';

export type NewlyAddedGeneType = 'solid' | 'fusion' | 'heme';
export type NewlyAddedGenesListItemProps = {
  title?: string;
  geneTypes?: NewlyAddedGeneType[];
  genes: string[];
};
export const NewlyAddedGenesListItem = (
  props: NewlyAddedGenesListItemProps
) => {
  return (
    <span>
      {props.title ? (
        props.title
      ) : (
        <span>
          Addition of {props.genes.length} new{' '}
          {props.geneTypes
            ? `${props.geneTypes.map(type => `${type}-`).join(', ')}associated `
            : undefined}
          {pluralize('gene', props.genes.length)}
        </span>
      )}
      :
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {props.genes.map((hugo: string) => (
          <span className="m-2" key={hugo}>
            <GenePageLink hugoSymbol={hugo} />
          </span>
        ))}
      </div>
    </span>
  );
};
