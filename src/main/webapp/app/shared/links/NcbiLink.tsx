import React from 'react';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';

export const NcbiLink: React.FunctionComponent<{
  entrezGeneId: number;
}> = props => {
  return (
    <span className={'d-flex'}>
      <b className={'mr-2'}>NCBI Gene:</b>
      <ExternalLinkIcon
        link={`https://www.ncbi.nlm.nih.gov/gene/${props.entrezGeneId}`}
      >
        {props.entrezGeneId}
      </ExternalLinkIcon>
    </span>
  );
};
