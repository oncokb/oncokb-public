import React from 'react';
import { PAGE_ROUTE } from 'app/config/constants';

export const SwaggerApiLink: React.FunctionComponent<{ content: string }> = (props) => {
  return (
    <a href={PAGE_ROUTE.SWAGGER_UI} target="_blank" rel="noopener noreferrer">
      {props.content}
    </a>
  );
};
