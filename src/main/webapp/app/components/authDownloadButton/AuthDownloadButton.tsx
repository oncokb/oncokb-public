import { Button, ButtonProps } from 'react-bootstrap';
import React from 'react';
import classnames from 'classnames';
import { RouterStore } from 'mobx-react-router';
import AuthenticationStore from 'app/store/AuthenticationStore';
import fileDownload from 'js-file-download';
import { PAGE_ROUTE } from 'app/config/constants';
import { getRedirectLoginState } from 'app/shared/utils/Utils';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';

interface IAuthDownloadButton extends ButtonProps {
  getDownloadData: () => Promise<string>;
  fileName: string;
  buttonText: string;
  routing?: RouterStore;
  className?: string;
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
          fileDownload(data, this.props.fileName);
        })
        .catch(error => {})
        .finally(() => {
          this.downloading = false;
        });
    } else {
      this.props.routing!.history.push(PAGE_ROUTE.LOGIN, getRedirectLoginState(this.props.routing!.location.pathname));
    }
  };

  render() {
    const { routing, authenticationStore, buttonText, getDownloadData, fileName, ...rest } = this.props;
    return (
      <Button size={'sm'} className={classnames('mr-1', 'mb-1')} onClick={this.onClick} {...rest}>
        {this.downloading ? (
          <LoadingIndicator isLoading={true} size={'small'} color="white" inline={false} />
        ) : (
          <>
            <i className={'fa fa-cloud-download mr-1'} />
            {buttonText}
          </>
        )}
      </Button>
    );
  }
}
