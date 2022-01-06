import * as React from 'react';
import { observer } from 'mobx-react';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictorySelectionContainer,
} from 'victory';
import WindowStore from 'app/store/WindowStore';
import { observable, computed } from 'mobx';
import autobind from 'autobind-decorator';
import ReactDOM from 'react-dom';
import BarChartToolTip from 'app/components/barChart/BarChartToolTip';
import { COLOR_BLUE, COLOR_GREY } from 'app/config/theme';
import {
  getTextHeight,
  getTextWidth,
  getTextDiagonal,
} from 'cbioportal-frontend-commons';
import _ from 'lodash';
import { PortalAlteration } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { FONT_FAMILY } from 'app/config/constants';

export type BarChartDatum = {
  x: string;
  y: number;
  alterations: PortalAlteration[];
  overlay: string;
};

export interface IBarChartProps {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  filters: string[];
  windowStore: WindowStore;
  onUserSelection?: (filters: string[]) => void;
}

// const VICTORY_THEME = generateTheme();
const TILT_ANGLE = 40;
const FONT_SIZE = 12;

@observer
export default class BarChart extends React.Component<IBarChartProps, {}> {
  @observable.ref
  private mousePosition = { x: 0, y: 0 };

  @observable
  private currentBarIndex = -1;

  @observable
  private toolTipModel: string | null = null;

  public static defaultProps = {
    filters: [],
    height: 300,
  };

  /*
   * Supplies the BarPlot with the event handlers needed to record when the mouse enters
   * or leaves a bar on the plot.
   */
  @autobind
  barPlotEvents() {
    return [
      {
        target: 'data',
        eventHandlers: {
          onMouseEnter() {
            return [
              {
                target: 'data',
                mutation(event: any) {
                  this.currentBarIndex = event.datum.eventKey;
                  this.toolTipModel = this.props.data[this.currentBarIndex].x;
                },
              },
            ];
          },
          onMouseLeave() {
            return [
              {
                target: 'data',
                mutation() {
                  this.toolTipModel = null;
                },
              },
            ];
          },
        },
      },
    ];
  }

  @autobind
  private onMouseMove(event: React.MouseEvent<any>): void {
    this.mousePosition = { x: event.pageX, y: event.pageY };
  }

  @computed
  get bottomPadding(): number {
    const MIN_PADDING = 10; // used when tickFormat is empty
    const padding =
      _.max(
        this.props.data.map(datum => {
          const content = datum.x;
          const fontFamily = FONT_FAMILY;
          const fontSize = `${FONT_SIZE}px`;
          const textHeight = getTextHeight(content, fontFamily, fontSize);
          const textWidth = getTextWidth(content, fontFamily, fontSize);
          if (TILT_ANGLE % 180 === 0) {
            return MIN_PADDING;
          } else if (TILT_ANGLE % 90 === 0) {
            return textWidth;
          } else {
            const textDiagonal = getTextDiagonal(textHeight, textWidth);
            return 10 + textDiagonal * Math.cos((Math.PI * TILT_ANGLE) / 180);
          }
        })
      ) || MIN_PADDING;
    return padding;
  }

  @computed
  get rightPadding(): number {
    const MIN_PADDING = 10; // used when tickFormat is empty
    const MAX_PADDING = 90;
    const lastThreeElements = _.takeRight(this.props.data, 3);
    const padding =
      _.max(
        lastThreeElements.map(datum => {
          const content = datum.x;
          const fontFamily = FONT_FAMILY;
          const fontSize = `${FONT_SIZE}px`;
          const textWidth = getTextWidth(content, fontFamily, fontSize);
          return (textWidth / 3) * 2;
        })
      ) || MIN_PADDING;
    return padding < MAX_PADDING ? padding : MAX_PADDING;
  }

  @computed
  get domainPadding(): number {
    const MIN_PADDING = 20;
    const MAX_PADDING = 40;
    return this.props.data.length < 6 ? MAX_PADDING : MIN_PADDING;
  }

  private isDataBinSelected(dataBin: BarChartDatum, filters: string[]) {
    return filters.find(filter => dataBin.x === filter);
  }

  public render() {
    return (
      <div onMouseMove={this.onMouseMove} style={{ width: '100%' }}>
        {this.props.data.length > 0 && (
          <VictoryChart
            containerComponent={
              <VictorySelectionContainer
                selectionDimension="x"
                onSelection={(points: any, bounds: any, props: any) => {
                  if (this.props.onUserSelection) {
                    const filters = _.uniq(
                      _.flatten(
                        points.map((point: any) =>
                          point.data.map((dataPoint: any) => dataPoint.xName)
                        )
                      )
                    );
                    // @ts-ignore
                    this.props.onUserSelection(filters);
                  }
                }}
              />
            }
            domainPadding={{
              x: [this.domainPadding, this.domainPadding],
              y: [20, 20],
            }}
            style={{
              parent: {
                width: '100%',
                height: this.props.height,
              },
            }}
            padding={{
              left: 50,
              right: this.rightPadding,
              top: 10,
              bottom: this.bottomPadding,
            }}
          >
            <VictoryAxis
              style={{
                tickLabels: {
                  angle: TILT_ANGLE,
                  verticalAnchor: 'middle',
                  textAnchor: 'start',
                  fontFamily: FONT_FAMILY,
                  fontSize: FONT_SIZE,
                },
                ticks: {
                  fill: 'transparent',
                  size: 4,
                  stroke: 'black',
                  strokeWidth: 1,
                },
              }}
            />
            <VictoryAxis
              dependentAxis={true}
              tickFormat={(t: number) =>
                Number.isInteger(t) ? t.toFixed(1) : t > 2 ? '' : t.toFixed(2)
              }
              label="% altered"
              style={{
                tickLabels: {
                  textAnchor: 'end',
                  fontFamily: FONT_FAMILY,
                  fontSize: FONT_SIZE,
                  padding: 5,
                },
                axisLabel: {
                  padding: 40,
                  fontFamily: FONT_FAMILY,
                },
                ticks: {
                  fill: 'transparent',
                  size: 4,
                  stroke: 'black',
                  strokeWidth: 1,
                },
              }}
            />
            <VictoryBar
              barRatio={1}
              style={{
                data: {
                  fill: (d: BarChartDatum) =>
                    this.isDataBinSelected(d, this.props.filters) ||
                    this.props.filters.length === 0
                      ? COLOR_BLUE
                      : COLOR_GREY,
                },
              }}
              data={this.props.data}
              // events={this.barPlotEvents}
            />
          </VictoryChart>
        )}
        {ReactDOM.createPortal(
          <BarChartToolTip
            mousePosition={this.mousePosition}
            windowWidth={this.props.windowStore.size.width}
            content={this.toolTipModel ? this.toolTipModel : ''}
            totalBars={this.props.data.length}
            currentBarIndex={this.currentBarIndex}
          />,
          document.body
        )}
      </div>
    );
  }
}
