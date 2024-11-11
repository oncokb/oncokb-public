import React from 'react';

const ShowHideToggleIcon: React.FunctionComponent<{
  show: boolean;
  onToggle?: () => void;
}> = props => {
  return (
    <span
      onClick={props.onToggle}
      className={`fa-stack`}
      style={{
        fontSize: '0.5rem',
      }}
    >
      <i className="fa fa-circle-thin fa-stack-2x"></i>
      <i
        className={`fa fa-chevron-${props.show ? 'up' : 'down'} fa-stack-1x`}
      ></i>
    </span>
  );
};
export default ShowHideToggleIcon;
