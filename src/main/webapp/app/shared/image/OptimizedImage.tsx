import React from 'react';

const OptimizedImage: React.FunctionComponent<
  {} & React.ImgHTMLAttributes<HTMLImageElement>
> = props => {
  return (
    <img
      {...props}
      style={{ imageRendering: '-webkit-optimize-contrast', ...props.style }}
    />
  );
};

export default OptimizedImage;
