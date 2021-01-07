import React from 'react';
import { RouterStore } from 'mobx-react-router';
import AuthenticationStore from 'app/store/AuthenticationStore';
import fileDownload from 'js-file-download';
import { PAGE_ROUTE } from 'app/config/constants';
import { getRedirectLoginState } from 'app/shared/utils/Utils';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import { LoadingButton } from 'app/shared/button/LoadingButton';
import { IDownloadButtonWithPromise } from 'app/components/downloadButtonWithPromise/DownloadButtonWithPromise';
import _ from 'lodash';

interface IAuthDownloadButton extends IDownloadButtonWithPromise {
  routing?: RouterStore;
  authenticationStore?: AuthenticationStore;
}

@inject('authenticationStore', 'routing')
@observer
export class AuthDownloadButton extends React.Component<IAuthDownloadButton> {
  @observable downloading = false;

  @action
  onClick = () => {
    if (this.props.authenticationStore!.isUserAuthenticated) {
      this.downloading = true;
      this.props
        .getDownloadData()
        .then(data => {
          if (_.isArray(data)) {
            data = data.join('');
          }
          fileDownload(data, this.props.fileName, this.props.mime);
        })
        .catch(error => {})
        .finally(() => {
          this.downloading = false;
        });
    } else {
      this.props.routing!.history.push(
        PAGE_ROUTE.LOGIN,
        getRedirectLoginState(
          this.props.routing!.location.pathname,
          this.props.routing!.location.search,
          this.props.routing!.location.hash
        )
      );
    }
  };

  render() {
    const {
      routing,
      authenticationStore,
      buttonText,
      getDownloadData,
      fileName,
      ...rest
    } = this.props;
    return (
      <LoadingButton
        onClick={this.onClick}
        loading={this.downloading}
        {...rest}
      >
        <>
          <i className={'fa fa-cloud-download mr-1'} />
          {buttonText}
        </>
      </LoadingButton>
    );
  }
}
