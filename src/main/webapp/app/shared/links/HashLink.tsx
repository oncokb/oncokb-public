import React from 'react';
import { observable } from 'mobx';
import { HashLink as Link } from 'react-router-hash-link';
import { scrollWidthOffsetInNews } from 'app/shared/utils/Utils';

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
          to={`${this.props.path}#${this.props.hash}`}
          scroll={scrollWidthOffsetInNews}
        >
          #
        </Link>
      </span>
    );
  }
}
