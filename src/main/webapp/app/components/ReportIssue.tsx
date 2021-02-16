import React from 'react';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import AppStore from 'app/store/AppStore';
import { Annotation, FeedbackType } from 'app/components/feedback/types';

export const ReportIssue: React.FunctionComponent<{
  appStore: AppStore;
  annotation?: Annotation;
}> = props => {
  return (
    <div style={{ fontSize: '0.9rem', color: 'grey' }}>
      <i>
        If you notice any mistakes or omissions, please reach out to us.{' '}
        <FeedbackIcon
          feedback={{
            type: FeedbackType.ANNOTATION,
            annotation: props.annotation,
          }}
          appStore={props.appStore}
        />
      </i>
    </div>
  );
};
