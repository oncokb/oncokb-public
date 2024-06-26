import React from 'react';
import { COLOR_BLACK, COLOR_LIGHT_GREY } from './../../config/theme';
import './styles.scss';

export interface TabNumbersProps {
  number: number;
  title: string;
}

class TabNumbers extends React.Component<TabNumbersProps> {
  getWidth = (num: number) => {
    if (num < 100) {
      return '1.4rem';
    } else if (num >= 100 && num < 1000) {
      return '1.6rem';
    } else {
      return '2rem';
    }
  };

  render() {
    const { number, title } = this.props;
    const alterationCountStyle = {
      width: this.getWidth(number),
    };

    return (
      <div className="tab-numbers-container">
        <h6>{title}</h6>
        <div className="alteration-count" style={alterationCountStyle}>
          {number > 1000 ? '1000+' : number}
        </div>
      </div>
    );
  }
}

export default TabNumbers;
