import React from 'react';
import { HighlightLinkButton } from 'app/components/highlightLinkButton/HighlightLinkButton';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';

type HomePageNumberProps = {
  number: number;
  title: string;
  href?: string;
  isLoading?: boolean;
};
export const HomePageNumber: React.FunctionComponent<HomePageNumberProps> = props => {
  return (
    <div className="d-flex flex-column align-items-center">
      <HighlightLinkButton href={props.href}>
        {props.isLoading ? (
          <LoadingIndicator isLoading size={LoaderSize.EXTRA_SMALL} />
        ) : (
          <span>{props.number}</span>
        )}
      </HighlightLinkButton>
      <span className="mt-1">{props.title}</span>
    </div>
  );
};
