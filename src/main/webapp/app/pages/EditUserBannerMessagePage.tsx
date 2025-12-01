import React, { useCallback, useState, useEffect } from 'react';
import { ErrorAlert } from 'app/shared/alert/ErrorAlert';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';
import { UserBannerMessageDTO } from 'app/shared/api/generated/API';
import client from 'app/shared/api/clientInstance';
import { notifySuccess } from 'app/shared/utils/NotificationUtils';
import UserBannerForm from 'app/components/userBannerForm/UserBannerForm';
import { Link, useParams } from 'react-router-dom';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { Button } from 'react-bootstrap';
import { PAGE_ROUTE } from 'app/config/constants';

enum EditBannerMessageStatus {
  EDIT_SUCCESS,
  EDIT_ERROR,
  LOAD_SUCCESS,
  LOAD_ERROR,
  EDIT_PENDING,
  LOAD_PENDING,
}

export default function EditUserBannerMessagePage() {
  const { id } = useParams();
  const [createBannerMessageStatus, setCreateBannerMessageStatus] = useState<
    EditBannerMessageStatus
  >();
  const [bannerMessage, setBannerMessage] = useState<UserBannerMessageDTO>();
  const [pageErrorMessage, setPageErrorMessage] = useState<OncoKBError>();
  const handleValidSubmit = useCallback(
    (updatedBannerMessage: UserBannerMessageDTO) => {
      setCreateBannerMessageStatus(EditBannerMessageStatus.EDIT_PENDING);
      client
        .updateUserBannerMessageUsingPUT({
          userBannerMessageDto: updatedBannerMessage,
        })
        .then(
          x => {
            notifySuccess('Banner message edited successfully!');
            setCreateBannerMessageStatus(EditBannerMessageStatus.EDIT_SUCCESS);
            // setBannerMessage(x);
            window.location.reload(false);
          },
          error => {
            setCreateBannerMessageStatus(EditBannerMessageStatus.EDIT_ERROR);
            setPageErrorMessage(error);
            window.scrollTo(0, 0);
          }
        );
    },
    []
  );

  useEffect(() => {
    setCreateBannerMessageStatus(EditBannerMessageStatus.LOAD_PENDING);
    client.getUserBannerMessageUsingGET({ id: +(id ?? '') }).then(
      x => {
        setCreateBannerMessageStatus(EditBannerMessageStatus.LOAD_SUCCESS);
        setBannerMessage(x);
      },
      error => {
        setCreateBannerMessageStatus(EditBannerMessageStatus.LOAD_ERROR);
        setPageErrorMessage(error);
      }
    );
  }, [id]);

  if (
    createBannerMessageStatus === EditBannerMessageStatus.LOAD_PENDING ||
    createBannerMessageStatus === EditBannerMessageStatus.EDIT_PENDING
  ) {
    return (
      <div>
        <LoadingIndicator isLoading />;
      </div>
    );
  }

  return (
    <div>
      <Link to={PAGE_ROUTE.ADMIN_USER_BANNER_MESSAGES}>
        <Button variant="link" className="pl-0">
          <i className="fa fa-chevron-left mr-2" />
          Back to banner messages
        </Button>
      </Link>
      {pageErrorMessage ? <ErrorAlert error={pageErrorMessage} /> : null}
      {createBannerMessageStatus !== EditBannerMessageStatus.LOAD_ERROR && (
        <UserBannerForm
          onValidSubmit={handleValidSubmit}
          existingBannerMessage={bannerMessage}
        />
      )}
    </div>
  );
}
