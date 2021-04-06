import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Button, ButtonProps } from 'react-bootstrap';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import classnames from 'classnames';

export const CopyButton: React.FunctionComponent<
  {
    text: string;
  } & ButtonProps &
    React.HTMLAttributes<HTMLButtonElement>
> = props => {
  const [copied, setCopied] = useState(false);

  function onCopy(event: any) {
    setCopied(true);
    if (props.onClick) {
      props.onClick(event);
    }
    setTimeout(() => setCopied(false), 5000);
  }

  const { text, onClick, ...rest } = props;
  return (
    <CopyToClipboard text={text}>
      <Button variant={'primary'} onClick={onCopy} {...rest}>
        <DefaultTooltip placement={'top'} overlay={copied ? 'Copied' : 'Copy'}>
          <i className={classnames('fa fa-copy')}></i>
        </DefaultTooltip>
      </Button>
    </CopyToClipboard>
  );
};
