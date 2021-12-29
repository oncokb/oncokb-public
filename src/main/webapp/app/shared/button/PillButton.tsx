import React from 'react';
import classnames from 'classnames';
import './PillButton.scss';

type PillButtonProps = {
  content: string;
  hasWarning?: boolean;
  onDelete: (item: string) => void;
};

export const PillButton: React.FunctionComponent<PillButtonProps> = props => {
  return (
    <div
      className={classnames(
        'content_container',
        props.hasWarning ? 'warning_content' : ''
      )}
    >
      <span
        className={'pill-delete'}
        onClick={() => props.onDelete(props.content)}
      >
        <i className="fa fa-times-circle"></i>
      </span>
      <span style={{ margin: '5px 10px 5px 5px' }}>{props.content}</span>
    </div>
  );
};
