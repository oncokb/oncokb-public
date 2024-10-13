import React from 'react';

const GeneAliasesDescription: React.FunctionComponent<{
  geneAliases: string[];
  className?: string;
  style?: React.CSSProperties;
}> = props => {
  return (
    <span
      className={props.className}
      style={props.style}
    >{`Also known as ${props.geneAliases.join(', ')}`}</span>
  );
};
export default GeneAliasesDescription;
