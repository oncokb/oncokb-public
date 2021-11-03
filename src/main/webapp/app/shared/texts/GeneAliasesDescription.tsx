import React from 'react';

const GeneAliasesDescription: React.FunctionComponent<{
  geneAliases: string[];
}> = props => {
  return <span>{`Also known as ${props.geneAliases.join(', ')}`}</span>;
};
export default GeneAliasesDescription;
