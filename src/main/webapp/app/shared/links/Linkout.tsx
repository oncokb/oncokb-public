import React, { CSSProperties } from 'react';

export const Linkout: React.FunctionComponent<{
  link: string;
  className?: string;
  style?: CSSProperties;
}> = props => {
  return (
    <a
      href={props.link}
      target="_blank"
      rel="noopener noreferrer"
      style={props.style}
      className={props.className}
    >
      {props.children ? props.children : props.link}
    </a>
  );
};
