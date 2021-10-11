import React from 'react';
import ProgressiveImage from 'react-progressive-image';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';

const OptimizedImage: React.FunctionComponent<
  {
    src: string;
    progressiveLoading?: boolean;
  } & React.ImgHTMLAttributes<HTMLImageElement>
> = props => {
  const { progressiveLoading, ...rest } = props;

  const ImgElement = () => (
    <img
      {...rest}
      style={{ imageRendering: '-webkit-optimize-contrast', ...props.style }}
    />
  );
  return progressiveLoading ? (
    <ProgressiveImage src={props.src} placeholder={''}>
      {(src: string, loading: boolean) => {
        return loading ? (
          <LoadingIndicator isLoading={true}>Loading image</LoadingIndicator>
        ) : (
          <ImgElement />
        );
      }}
    </ProgressiveImage>
  ) : (
    <ImgElement />
  );
};

export default OptimizedImage;
