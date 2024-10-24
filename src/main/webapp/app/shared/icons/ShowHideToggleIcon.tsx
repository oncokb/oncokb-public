import React from 'react';

const ShowHideToggleIcon: React.FunctionComponent<{
  show: boolean;
  onToggle?: () => void;
}> = props => {
  return (
    <i
      onClick={props.onToggle}
      className={`fa fa-chevron-circle-${props.show ? 'up' : 'down'}`}
    ></i>
  );
};
export default ShowHideToggleIcon;
