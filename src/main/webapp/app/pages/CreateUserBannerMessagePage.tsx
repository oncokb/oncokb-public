import React, { useCallback, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { ErrorAlert } from 'app/shared/alert/ErrorAlert';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';
import { UserBannerMessageDTO } from 'app/shared/api/generated/API';
import client from 'app/shared/api/clientInstance';
import { RouterStore } from 'mobx-react-router';
import { notifySuccess } from 'app/shared/utils/NotificationUtils';
import UserBannerForm from 'app/components/userBannerForm/UserBannerForm';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';

enum CreateBannerMessageStatus {
  CREATE_SUCCESS,
  CREATE_ERROR,
  PENDING,
}

export default function CreateUserBannerMessagePage() {
  const [createBannerMessageStatus, setCreateBannerMessageStatus] = useState<
    CreateBannerMessageStatus
  >();
  const [createBannerMessageError, setCreateBannerMessageError] = useState<
    OncoKBError
  >();
  const history = useHistory();

  const handleValidSubmit = useCallback(
    (newBannerMessage: UserBannerMessageDTO) => {
      setCreateBannerMessageStatus(CreateBannerMessageStatus.PENDING);
      client
        .createUserBannerMessageUsingPOST({
          userBannerMessageDto: newBannerMessage,
        })
        .then(
          ({ id }) => {
            notifySuccess('Banner message created successfully!');
            history.push(`/admin/user-banner-messages/${id}`);
            setCreateBannerMessageStatus(
              CreateBannerMessageStatus.CREATE_SUCCESS
            );
          },
          error => {
            setCreateBannerMessageStatus(
              CreateBannerMessageStatus.CREATE_ERROR
            );
            setCreateBannerMessageError(error);
            window.scrollTo(0, 0);
          }
        );
    },
    []
  );

  if (createBannerMessageStatus === CreateBannerMessageStatus.PENDING) {
    return (
      <div>
        <LoadingIndicator isLoading />;
      </div>
    );
  }

  return (
    <div>
      {createBannerMessageError ? (
        <ErrorAlert error={createBannerMessageError} />
      ) : null}
      <UserBannerForm onValidSubmit={handleValidSubmit} />
    </div>
  );
}
