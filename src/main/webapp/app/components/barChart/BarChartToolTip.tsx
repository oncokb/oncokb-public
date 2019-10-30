import * as React from 'react';
import * as _ from 'lodash';
import { computed } from 'mobx';
import { Popover } from 'react-bootstrap';
import classnames from 'classnames';
import { observer } from 'mobx-react';

export type BarChartToolTipProps = {
  mousePosition: { x: number; y: number };
  totalBars: number;
  currentBarIndex: number;
  content: string;
  windowWidth: number;
};

export const VERTICAL_OFFSET = 17;
export const HORIZONTAL_OFFSET = 8;

const WIDTH = 150;

@observer
export default class BarChartToolTip extends React.Component<
  BarChartToolTipProps,
  {}
> {
  /**
   * When the active bar is past the middle of the plot, render on the left side of the bar
   */
  @computed
  get placement(): 'left' | 'right' {
    return this.props.totalBars < this.props.currentBarIndex * 2
      ? 'left'
      : 'right';
  }

  @computed
  get positionLeft(): number {
    if (this.placement === 'left') {
      return this.props.mousePosition.x - (HORIZONTAL_OFFSET + WIDTH);
    } else {
      return this.props.mousePosition.x + HORIZONTAL_OFFSET;
    }
  }

  @computed
  get transform(): string | undefined {
    return this.placement === 'left' ? 'translate(-100%,0%)' : undefined;
  }

  render() {
    if (!this.props.content) {
      return null;
    }

    return <div></div>;
  }
}
