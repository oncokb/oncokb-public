import React from 'react';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import AppStore from 'app/store/AppStore';
import { FeedbackType } from 'app/components/feedback/types';

export const ReportIssue: React.FunctionComponent<{
  appStore: AppStore;
}> = props => {
  return (
    <div style={{ fontSize: '0.9rem', color: 'grey' }}>
      <i>
        If you notice any mistakes or missing alterations / citations, please
        reach out to us{' '}
        <FeedbackIcon
          feedback={{ type: FeedbackType.GENERAL }}
          appStore={props.appStore}
        />
      </i>
    </div>
  );
};
