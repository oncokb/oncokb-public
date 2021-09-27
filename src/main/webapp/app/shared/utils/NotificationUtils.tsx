import { toast } from 'react-toastify';
import _ from 'lodash';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';

const getFormattedMessage = (message: string) => {
  return _.upperFirst(message);
};
const getErrorMessage = (error: OncoKBError, additionalInfo?: string) => {
  const content: string[] = [];
  if (additionalInfo) {
    content.push(additionalInfo);
  }
  if (error.response?.body) {
    if (error.response.body.title) {
      content.push(error.response.body.title);
    }
    if (error.response.body.message) {
      content.push(error.response.body.message);
    }
  } else {
    content.push(error.message);
  }
  return content.map(item => getFormattedMessage(item)).join('\n');
};

export const notifyInfo = (message: string) => {
  return toast.info(getFormattedMessage(message), {
    className: 'bg-primary',
  });
};

export const notifySuccess = (message: string) => {
  return toast.success(getFormattedMessage(message), {
    className: 'bg-success',
  });
};
export const notifyWarning = (error: OncoKBError, additionalInfo?: string) => {
  return toast.warn(getErrorMessage(error, additionalInfo), {
    className: 'bg-warning',
  });
};
export const notifyError = (
  error: Error | OncoKBError,
  additionalInfo?: string
) => {
  return toast.error(getErrorMessage(error, additionalInfo), {
    className: 'bg-danger',
  });
};
