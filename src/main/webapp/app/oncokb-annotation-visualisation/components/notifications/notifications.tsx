import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import React from 'react';
import { COLOR_ERROR } from './../../config/theme';
interface NotificationImplication {
  message: string;
  type: string;
}

enum NotificationType {
  'danger' = 'exclamation-circle',
  'primary' = 'info-circle',
  'warning' = 'exclamation-triangle',
  'success' = 'check',
}
interface NotificationProps {
  notifications: NotificationImplication[];
}

export default function Notification({ notifications }: NotificationProps) {
  const [show, setShow] = useState(false);
  const [showNotificationsCount, setShowNotificationsCount] = useState(true);
  const toggleShow = () => {
    setShow(!show);
    if (showNotificationsCount) setShowNotificationsCount(false);
  };

  return (
    <div style={{ position: 'absolute', top: '80px', right: '10px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <i
          className="fa fa-bell fa-lg"
          onClick={toggleShow}
          style={{ position: 'relative', cursor: 'pointer' }}
          aria-hidden="true"
        >
          {showNotificationsCount && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                left: '12px',
                backgroundColor: COLOR_ERROR,
                color: '#fff',
                width: '0.8rem',
                lineHeight: '0.8rem',
                borderRadius: '50%',
                fontSize: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {notifications.length}
            </span>
          )}
        </i>
      </div>
      {show && (
        <div
          className="mt-3"
          style={{
            position: 'absolute',
            top: '10px',
            width: '300px',
            right: '20px',
            zIndex: 1001,
          }}
        >
          {notifications &&
            notifications.map(notification => (
              <Alert key={notification.message} variant={notification.type}>
                <i
                  className={`fa fa-${
                    NotificationType[notification.type]
                  } mr-2`}
                  aria-hidden="true"
                ></i>
                {notification.message}
              </Alert>
            ))}
          {!notifications && (
            <Alert variant="warning">
              <i
                className={`fa fa-${NotificationType['warning']} mr-2`}
                aria-hidden="true"
              ></i>
              No Messages.
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
