import { toast } from 'react-toastify';
import _ from 'lodash';

const getFormattedMessage = (message: string) => {
  return _.upperFirst(message);
};
const getErrorMessage = (error: Error, additionalInfo?: string) => {
  return getFormattedMessage(
    `${additionalInfo ? `${_.upperFirst(additionalInfo)}: ` : ''}${
      error.message
    }`
  );
};

export const notifyInfo = (message: string) => {
  return toast.info(getFormattedMessage(message), {
    className: 'bg-primary'
  });
};

export const notifySuccess = (message: string) => {
  return toast.success(getFormattedMessage(message), {
    className: 'bg-success'
  });
};
export const notifyWarning = (error: Error, additionalInfo?: string) => {
  return toast.warn(getErrorMessage(error, additionalInfo), {
    className: 'bg-warning'
  });
};
export const notifyError = (error: Error, additionalInfo?: string) => {
  return toast.error(getErrorMessage(error, additionalInfo), {
    className: 'bg-danger'
  });
};
