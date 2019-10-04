import * as React from 'react';
import { If, Then } from 'react-if';
import Spinner from 'react-spinkit';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { COLOR_BLUE } from 'app/config/theme';

export interface ILoader {
  isLoading: boolean;
  style?: any;
  color?: string;
  inline?: boolean;
  center?: boolean;
  centerRelativeToContainer?: boolean;
  size?: 'big' | 'small';
  className?: string;
}

export default class LoadingIndicator extends React.Component<ILoader, {}> {
  public static defaultProps = {
    inline: true,
    color: COLOR_BLUE,
    center: false,
    size: 'small'
  };

  public render() {
    const color = this.props.size === 'small' ? COLOR_BLUE : 'white';
    const spinnerStyles = {
      [styles.small]: this.props.size === 'small',
      [styles.big]: this.props.size === 'big',
      inlineBlock: this.props.inline
    };

    const parentStyles = {
      [styles.centered]: this.props.center,
      [styles['centered-relative-to-container']]: this.props.centerRelativeToContainer,
      [styles['centered-with-children']]:
        (this.props.center || this.props.centerRelativeToContainer) && React.Children.count(this.props.children) > 0,
      inlineBlock: this.props.inline
    };

    return (
      <If condition={this.props.isLoading}>
        <Then>
          <div className={classNames(parentStyles, this.props.className)} style={this.props.style || {}}>
            <Spinner
              color={color}
              fadeIn="none"
              className={classNames(spinnerStyles)}
              style={{ display: 'inline-block' }}
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
//       <Spinner className={classNames(styles.color, styles.centered, styles.big)} fadeIn="none" name="line-scale-pulse-out" />
//     </Portal>
//   }
//
// }
