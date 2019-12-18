import React from 'react';

export const Linkout: React.FunctionComponent<{ link: string }> = props => {
  return (
    <a href={props.link} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  );
};
