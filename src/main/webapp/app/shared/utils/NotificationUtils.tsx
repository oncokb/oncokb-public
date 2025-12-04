import { toast } from 'react-toastify';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';
import { upperFirst } from 'app/shared/utils/LodashUtils';

const getFormattedMessage = (message: string) => {
  if (!message) {
    return '';
  }

  const firstChar = message.charAt(0);
  // If the first character is already uppercase, keep the message as is.
  if (firstChar === firstChar.toUpperCase()) {
    return message;
  }

  // Otherwise, normalize by uppercasing the first character and lowercasing the rest
  return upperFirst(message);
};

const getErrorMessage = (
  error: OncoKBError,
  additionalInfo?: string,
  includeDetails?: boolean
) => {
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
    if (includeDetails && error.response.body.detail) {
      content.push(error.response.body.detail);
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
export const notifyWarning = (
  error: OncoKBError,
  additionalInfo?: string,
  includeDetails?: boolean
) => {
  return toast.warn(getErrorMessage(error, additionalInfo, includeDetails), {
    className: 'bg-warning',
  });
};
export const notifyError = (
  error: Error | OncoKBError,
  additionalInfo?: string,
  includeDetails?: boolean
) => {
  return toast.error(getErrorMessage(error, additionalInfo, includeDetails), {
    className: 'bg-danger',
  });
};
