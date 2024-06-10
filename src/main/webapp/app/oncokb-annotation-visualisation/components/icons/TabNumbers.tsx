import React from 'react';
import { COLOR_GREY } from 'app/config/theme';

export interface TabNumbersProps {
  number: number;
  title: string;
}

class TabNumbers extends React.Component<TabNumbersProps> {
  getWidth = (num: number) => {
    if (num < 100) {
      return '1.2rem';
    } else if (num >= 100 && num < 1000) {
      return '1.5rem';
    } else {
      return '2rem';
    }
  };

  render() {
    const alterationCountStyle = {
      width: this.getWidth(this.props.number),
      lineHeight: '1.2rem',
      borderRadius: '50%',
      textAlign: 'center',
      backgroundColor: COLOR_GREY,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '10px',
      overflow: 'hidden',
      fontSize: 'calc(0.5vw)',
      whiteSpace: 'nowrap',
    };

    return (
      <div
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      >
        <h6 style={{ margin: 0 }}>{this.props.title}</h6>
        <div style={alterationCountStyle}>{this.props.number}</div>
      </div>
    );
  }
}

export default TabNumbers;
