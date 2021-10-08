import * as React from 'react';

import mskLogo from 'content/images/msk-logo-white.svg';
import mskIcon from 'content/images/msk-icon-white.svg';
import OptimizedImage from 'app/shared/image/OptimizedImage';

class MskccLogo extends React.Component<{
  imageHeight?: number;
  size?: 'sm' | 'lg';
  className?: string;
}> {
  public static defaultProps = {
    size: 'lg',
  };
  public render() {
    return (
      <a
        href="https://www.mskcc.org"
        target="_blank"
        rel="noopener noreferrer"
        className={this.props.className}
        style={{ display: 'block' }}
      >
        <OptimizedImage
          alt="mskcc-logo"
          src={this.props.size === 'lg' ? mskLogo : mskIcon}
          style={{
            height: this.props.imageHeight || 50,
          }}
        />
      </a>
    );
  }
}

export default MskccLogo;
