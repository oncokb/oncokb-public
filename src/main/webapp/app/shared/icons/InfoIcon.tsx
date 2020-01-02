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
      <span
        className={`fa-stack ${props.className}`}
        style={{
          fontSize: '0.6rem',
          ...props.style
        }}
      >
        <i className="fa fa-circle-thin fa-stack-2x"></i>
        <i className="fa fa-info fa-stack-1x"></i>
      </span>
    </DefaultTooltip>
  );
};
export default InfoIcon;
