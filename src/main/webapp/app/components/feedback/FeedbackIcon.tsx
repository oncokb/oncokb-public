import React from 'react';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import AppStore from 'app/store/AppStore';
import { getAnnotationString } from 'app/components/feedback/FeedbackForm';
import { Feedback, FeedbackType } from 'app/components/feedback/types';
import { ONCOKB_TM } from 'app/config/constants';

export const FeedbackIcon = (props: {
  feedback: Feedback;
  appStore: AppStore;
}) => {
  let tooltipOverlay = '';
  switch (props.feedback.type) {
    case FeedbackType.ANNOTATION:
      tooltipOverlay = `Send annotation suggestion for ${getAnnotationString(
        props.feedback.annotation
      )} to ${ONCOKB_TM}`;
      break;
    case FeedbackType.GENERAL:
      tooltipOverlay = `Send feedback to ${ONCOKB_TM}`;
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
