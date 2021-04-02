import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Button } from 'react-bootstrap';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import classnames from 'classnames';

export const CopyButton: React.FunctionComponent<{
  text: string;
}> = props => {
  const [copied, setCopied] = useState(false);

  function onCopy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  }

  return (
    <CopyToClipboard text={props.text}>
      <Button variant={'primary'} onClick={onCopy}>
        <DefaultTooltip placement={'top'} overlay={copied ? 'Copied' : 'Copy'}>
          <i className={classnames('fa fa-copy')}></i>
        </DefaultTooltip>
      </Button>
    </CopyToClipboard>
  );
};
