import React from 'react';

export const Linkout: React.FunctionComponent<{
  link: string;
  className?: string;
}> = props => {
  return (
    <a
      href={props.link}
      target="_blank"
      rel="noopener noreferrer"
      className={props.className}
    >
      {props.children}
    </a>
  );
};
