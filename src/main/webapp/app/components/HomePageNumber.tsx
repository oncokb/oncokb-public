import React from 'react';
import { HighlightLinkButton } from 'app/components/highlightLinkButton/HighlightLinkButton';

type HomePageNumberProps = {
  number: number;
  title: string;
};
export const HomePageNumber: React.FunctionComponent<HomePageNumberProps> = props => {
  return (
    <div className="d-flex flex-column align-items-center">
      <HighlightLinkButton>{props.number}</HighlightLinkButton>
      <span className="mt-1">{props.title}</span>
    </div>
  );
};
