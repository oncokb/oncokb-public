import { ButtonProps } from 'react-bootstrap';
import React from 'react';
import classnames from 'classnames';
import fileDownload from 'js-file-download';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import { LoadingButton } from 'app/shared/button/LoadingButton';

export interface IDownloadButtonWithPromise extends ButtonProps {
  getDownloadData: () => Promise<string>;
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
        fileDownload(data, this.props.fileName, this.props.mime);
      })
      .catch(error => {})
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
