import React, { useState } from 'react';
import { If, Then, Else } from 'react-if';
import {
  Feedback,
  FeedbackContent,
  FeedbackType,
} from 'app/components/feedback/types';
import {
  FeedbackForm,
  getAnnotationString,
} from 'app/components/feedback/FeedbackForm';
import { Modal } from 'react-bootstrap';
import client from 'app/shared/api/clientInstance';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';

export const FeedbackModal: React.FunctionComponent<{
  showModal: boolean;
  onHideModal: () => void;
  feedback: Feedback;
}> = props => {
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [sentFeedback, setSentFeedback] = useState(false);

  function getFeedbackTitle() {
    let modalTitle = '';
    switch (props.feedback.type) {
      case FeedbackType.ANNOTATION:
        modalTitle = `Annotation suggestion for ${getAnnotationString(
          props.feedback.annotation
        )}`;
        break;
      case FeedbackType.GENERAL:
        modalTitle = 'Feedback';
        break;
      default:
        break;
    }
    return modalTitle;
  }

  const modalTitle = getFeedbackTitle();

  function getFeedbackEmailBody(description?: string) {
    let body = description ? description : '';
    switch (props.feedback.type) {
      case FeedbackType.ANNOTATION:
        body = 'Reference (PMIDs, Abstracts, Links):\n\n' + body;
        break;
      default:
        break;
    }
    return body;
  }

  function onSubmit(content: FeedbackContent) {
    setSendingFeedback(true);
    client
      .sendFeedbackMailsUsingPOST({
        from: content.email!,
        subject: getFeedbackTitle(),
        description: getFeedbackEmailBody(content.description),
        userName: content.name!,
      })
      .then(() => {
        setSentFeedback(true);
      })
      .catch(e => {
        notifyError(e);
      })
      .finally(() => {
        setSendingFeedback(false);
      });
  }

  function onHideModal() {
    setSendingFeedback(false);
    setSentFeedback(false);
    props.onHideModal();
  }

  return (
    <Modal show={props.showModal} onHide={onHideModal}>
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <If condition={sendingFeedback}>
          <Then>
            <LoadingIndicator isLoading={true} />
          </Then>
          <Else>
            <If condition={sentFeedback}>
              <Then>
                Thank you. We have sent your feedback to the OncoKB team.
              </Then>
              <Else>
                Thank you for using the feedback feature. Please provide the
                following information
                <FeedbackForm {...props.feedback} onSubmit={onSubmit} />
              </Else>
            </If>
          </Else>
        </If>
      </Modal.Body>
    </Modal>
  );
};
