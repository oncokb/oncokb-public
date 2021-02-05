import React from 'react';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import AppStore from 'app/store/AppStore';
import { getAnnotationString } from 'app/components/feedback/FeedbackForm';
import { Feedback, FeedbackType } from 'app/components/feedback/types';

export const FeedbackIcon = (props: {
  feedback: Feedback;
  appStore: AppStore;
}) => {
  let tooltipOverlay = '';
  switch (props.feedback.type) {
    case FeedbackType.ANNOTATION:
      tooltipOverlay = `Send annotation suggestion to OncoKB for ${getAnnotationString(
        props.feedback.annotation
      )}`;
      break;
    case FeedbackType.GENERAL:
      tooltipOverlay = 'Send feedback to OncoKB';
      break;
    default:
      break;
  }

  function onClick() {
    props.appStore.showFeedbackFormModal = true;
    props.appStore.feedbackAnnotation = props.feedback;
  }

  return (
    <>
      <DefaultTooltip overlay={tooltipOverlay}>
        <i className="fa fa-envelope-o" aria-hidden="true" onClick={onClick} />
      </DefaultTooltip>
    </>
  );
};
