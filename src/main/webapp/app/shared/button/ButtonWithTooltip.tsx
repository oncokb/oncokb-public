import React from 'react';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { DefaultTooltipProps } from 'cbioportal-frontend-commons/dist/components/defaultTooltip/DefaultTooltip';
import { Button, ButtonProps } from 'react-bootstrap';

/**
 * Disabled elements need to be wrapped in a div or span, otherwise the tooltip
 * will not show because mouse events are not triggered on disabled elements.
 * See https://getbootstrap.com/docs/3.4/javascript/#tooltips
 * Also https://github.com/react-component/tooltip/issues/18 highlights some issues
 * related to tooltip.
 */

const ButtonWithTooltip: React.FunctionComponent<{
  tooltipProps: DefaultTooltipProps;
  buttonProps: ButtonProps;
  buttonContent: string | JSX.Element;
}> = props => {
  const { tooltipProps, buttonProps, buttonContent } = props;
  const button = (
    <Button
      style={buttonProps.disabled ? { pointerEvents: 'none' } : {}}
      {...buttonProps}
    >
      {buttonContent}
    </Button>
  );
  return (
    <DefaultTooltip {...tooltipProps}>
      {buttonProps.disabled ? (
        <span
          style={{
            cursor: `${buttonProps.disabled ? 'not-allowed' : 'pointer'}`,
          }}
        >
          {button}
        </span>
      ) : (
        button
      )}
    </DefaultTooltip>
  );
};

export default ButtonWithTooltip;
