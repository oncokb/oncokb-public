import React from 'react';
import { RCTooltip } from 'rc-tooltip';
import { DefaultTooltip } from 'cbioportal-frontend-commons';

const InfoIcon: React.FunctionComponent<{
  overlay?:
    | (() => React.ReactChild)
    | React.ReactChild
    | React.ReactFragment
    | React.ReactPortal;
  placement?: RCTooltip.Placement;
  style?: React.CSSProperties;
  className?: string;
}> = props => {
  return (
    <DefaultTooltip
      overlay={props.overlay ? props.overlay : <span></span>}
      placement={props.placement}
    >
      <i
        className={`fa fa-info-circle ${props.className}`}
        style={{
          color: 'grey',
          fontSize: '0.8rem',
          ...props.style,
        }}
      ></i>
    </DefaultTooltip>
  );
};
export default InfoIcon;
