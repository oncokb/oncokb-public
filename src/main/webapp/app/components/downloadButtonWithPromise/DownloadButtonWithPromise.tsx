import { ButtonProps } from 'react-bootstrap';
import React from 'react';
import fileDownload from 'js-file-download';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import { LoadingButton } from 'app/shared/button/LoadingButton';
import { notifyError } from 'app/shared/utils/NotificationUtils';

export interface IDownloadButtonWithPromise extends ButtonProps {
  getDownloadData: () => Promise<string | Blob | string[] | null | undefined>;
  fileName: string;
  mime?: string;
  buttonText: string;
  className?: string;
}

@observer
export class DownloadButtonWithPromise extends React.Component<
  IDownloadButtonWithPromise
> {
  @observable downloading = false;

  @action
  onClick = () => {
    this.downloading = true;
    this.props
      .getDownloadData()
      .then(data => {
        if (Array.isArray(data)) {
          data = data.join('');
        } else if (data === undefined || data === null) {
          return;
        }
        fileDownload(data, this.props.fileName, this.props.mime);
      })
      .catch(error => {
        console.error(error);
        notifyError(
          new Error(
            `There was an error fetching the file "${this.props.fileName}"`
          )
        );
      })
      .finally(() => {
        this.downloading = false;
      });
  };

  render() {
    const { buttonText, getDownloadData, fileName, ...rest } = this.props;
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
