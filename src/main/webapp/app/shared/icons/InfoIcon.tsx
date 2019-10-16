import React from 'react';
import { RCTooltip } from 'rc-tooltip';
import { DefaultTooltip } from 'cbioportal-frontend-commons';

const InfoIcon: React.FunctionComponent<{
  overlay?: React.ReactNode;
  placement?: RCTooltip.Placement;
  style?: React.CSSProperties;
  className?: string;
}> = props => {
  return (
    <DefaultTooltip overlay={props.overlay} placement={props.placement}>
      <span className={`fa-stack ${props.className}`} style={props.style}>
        <i className="fa fa-circle-thin fa-stack-2x"></i>
        <i className="fa fa-info fa-stack-1x"></i>
      </span>
    </DefaultTooltip>
  );
};
export default InfoIcon;
