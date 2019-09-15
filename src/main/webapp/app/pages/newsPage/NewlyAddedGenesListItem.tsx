import React from 'react';
import pluralize from 'pluralize';

export type NewlyAddedGeneType = 'solid' | 'fusion' | 'heme';
export type NewlyAddedGenesListItemProps = {
  geneTypes?: NewlyAddedGeneType[];
  genes: string[];
};
export const NewlyAddedGenesListItem = (props: NewlyAddedGenesListItemProps) => {
  return (
    <li>
      Addition of {props.genes.length} new{' '}
      {props.geneTypes ? `${props.geneTypes.map(type => `${type}-`).join(', ')}associated ` : undefined}
      {pluralize('gene', props.genes.length)}:
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {props.genes.map((hugo: string) => (
          <span className="m-2" key={hugo}>
            <a href={`gene/${hugo}`}>{hugo}</a>
          </span>
        ))}
      </div>
    </li>
  );
};
