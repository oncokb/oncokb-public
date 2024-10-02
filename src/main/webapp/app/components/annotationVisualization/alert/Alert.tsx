import React from 'react';
import './Alert.scss';

export interface NotificationImplication {
  message: string;
  type: 'danger' | 'primary' | 'warning' | 'success';
}

interface AlertProps {
  notification: NotificationImplication;
}

export enum NotificationType {
  'danger' = 'exclamation-circle',
  'primary' = 'info-circle',
  'warning' = 'exclamation-triangle',
  'success' = 'check',
}

const Alert: React.FC<AlertProps> = ({ notification }) => {
  return (
    <div role="alert" className={`alert alert-${notification.type}`}>
      <i
        className={`fa fa-${NotificationType[notification.type]} mr-2`}
        aria-hidden="true"
        data-testid="alert-icon"
      ></i>
      {notification.message}
    </div>
  );
};

export default Alert;
