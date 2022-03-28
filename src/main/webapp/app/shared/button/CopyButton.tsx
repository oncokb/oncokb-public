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
    <CopyToClipboard
      text={text}
      options={{
        format: 'text/plain',
      }}
    >
      <DefaultTooltip placement={'top'} overlay={copied ? 'Copied' : 'Copy'}>
        <Button variant={'primary'} onClick={onCopy} {...rest}>
          <i className={classnames('fa fa-copy')}></i>
        </Button>
      </DefaultTooltip>
    </CopyToClipboard>
  );
};
