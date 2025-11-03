import React, { FormEventHandler, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { notifyError } from '../utils/NotificationUtils';

export type IFormTextAreaProps = {
  id?: string;
  onTextAreaChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  value?: string;
  boldLabel?: boolean;
  rows?: number;
  readOnly?: boolean;
  allowFileUpload?: boolean;
};

export const FormTextAreaField: React.FunctionComponent<IFormTextAreaProps> = props => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile: FormEventHandler<HTMLInputElement> = event => {
    if (fileInputRef.current) {
      const file = fileInputRef.current.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (textAreaRef.current) {
            const nativeTextAreaSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              'value'
            )!.set!;
            nativeTextAreaSetter.call(
              textAreaRef.current,
              reader.result?.toString() || ''
            );
            textAreaRef.current.dispatchEvent(
              new Event('change', { bubbles: true })
            );
          }
        };
        reader.readAsText(file);
      }
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="form-group">
      <label
        htmlFor={props.id}
        className={props.boldLabel ? 'form-label font-weight-bold' : ''}
      >
        {props.label}
        {props.allowFileUpload && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline-primary"
            className="ml-2"
            size="sm"
          >
            <i className="fa fa-cloud-upload" />
            <span className="ml-1">Upload File</span>
          </Button>
        )}
      </label>
      <textarea
        id={props.id}
        ref={textAreaRef}
        onChange={props.onTextAreaChange}
        style={props.style || { minHeight: '50px' }}
        className="form-control"
        disabled={props.disabled || false}
        defaultValue={props.value}
        rows={props.rows}
        readOnly={props.readOnly}
      />
      {props.allowFileUpload && (
        <input
          accept=".txt,.tsv"
          onInput={handleUploadFile}
          className="d-none"
          ref={fileInputRef}
          type="file"
        />
      )}
    </div>
  );
};
