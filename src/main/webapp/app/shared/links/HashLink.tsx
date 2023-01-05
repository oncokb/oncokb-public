import React from 'react';
import { observable } from 'mobx';
import { HashLink as Link } from 'react-router-hash-link';
import { scrollWidthOffset } from 'app/shared/utils/Utils';

export default class HashLink extends React.Component<{
  path: string;
  hash: string;
  show: boolean;
}> {
  @observable hide = true;

  render() {
    return (
      <span
        className={'ml-2'}
        style={{
          display: this.props.show ? 'inline-block' : 'none',
        }}
      >
        <Link
          to={{
            pathname: this.props.path,
            hash: this.props.hash,
          }}
          scroll={scrollWidthOffset}
        >
          #
        </Link>
      </span>
    );
  }
}
