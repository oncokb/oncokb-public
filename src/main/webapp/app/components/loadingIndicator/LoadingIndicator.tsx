import * as React from 'react';
import { If, Then } from 'react-if';
import Spinner from 'react-spinkit';
import classnames from 'classnames';
import styles from './styles.module.scss';
import { COLOR_BLUE } from 'app/config/theme';

export interface ILoader {
  isLoading: boolean;
  style?: any;
  color?: string;
  center?: boolean;
  centerRelativeToContainer?: boolean;
  size?: 'big' | 'small';
  className?: string;
}

export default class LoadingIndicator extends React.Component<ILoader, {}> {
  public static defaultProps = {
    center: false,
    size: 'small',
  };

  public render() {
    const color = this.props.color
      ? this.props.color
      : this.props.size === 'small'
      ? COLOR_BLUE
      : 'white';
    const spinnerStyles = {
      [styles.small]: this.props.size === 'small',
      [styles.big]: this.props.size === 'big',
      'd-flex': true,
      'justify-content-center': true,
    };

    const parentStyles = {
      [styles.centered]: this.props.center,
      [styles['centered-relative-to-container']]: this.props
        .centerRelativeToContainer,
      [styles['centered-with-children']]:
        (this.props.center || this.props.centerRelativeToContainer) &&
        React.Children.count(this.props.children) > 0,
    };

    return (
      <If condition={this.props.isLoading}>
        <Then>
          <div
            className={classnames(parentStyles, this.props.className)}
            style={this.props.style || {}}
          >
            <Spinner
              color={color}
              fadeIn="none"
              className={classnames(spinnerStyles)}
              style={this.props.style}
              name="line-scale-pulse-out"
            />
            <div className={styles.progressUI}>{this.props.children}</div>
          </div>
        </Then>
      </If>
    );
  }
}

// export class GlobalLoader extends React.Component<ILoader, {}> {
//
//   public render() {
//     return <Portal isOpened={this.props.isLoading}>
//       <Spinner className={classnames(styles.color, styles.centered, styles.big)} fadeIn="none" name="line-scale-pulse-out" />
//     </Portal>
//   }
//
// }
