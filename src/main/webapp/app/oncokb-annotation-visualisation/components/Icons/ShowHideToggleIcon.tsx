import React from 'react';

const ShowHideToggleIcon: React.FunctionComponent<{
  show: boolean;
  onToggle?: () => void;
}> = props => {
  return (
    <i
      onClick={props.onToggle}
      className={`fa fa-arrow-circle-o-${props.show ? 'up' : 'down'}`}
    ></i>
  );
};
export default ShowHideToggleIcon;
