import React, { CSSProperties } from 'react';

export const Linkout: React.FunctionComponent<{
  link: string;
  className?: string;
  style?: CSSProperties;
  addHttpsProtocol?: boolean;
}> = props => {
  let updatedLink = props.link;
  if (props.addHttpsProtocol === undefined || props.addHttpsProtocol) {
    if (!/http(s)?\/\/.*/.test(updatedLink)) {
      updatedLink = `https://${updatedLink}`;
    }
  }
  return (
    <a
      href={updatedLink}
      target="_blank"
      rel="noopener noreferrer"
      style={props.style}
      className={props.className}
    >
      {props.children ? props.children : props.link}
    </a>
  );
};
