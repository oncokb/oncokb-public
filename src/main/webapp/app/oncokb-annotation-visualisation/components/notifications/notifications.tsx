import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import React from 'react';
interface NotificationImplication {
  message: string;
  type: string;
}

enum NotificationType {
  ERROR = 'exclamation-circle',
  INFO = 'info-circle',
  WARNING = 'exclamation-triangle',
  SUCCESS = 'check',
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
    <div className="flex relative">
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
                backgroundColor: 'rgba(212, 19, 13, 1)',
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
        <div className="mt-3">
          {notifications &&
            notifications.map(notification => (
              <Alert key={notification.message} variant={notification.type}>
                <i
                  className={`fa fa-${NotificationType[notification.type]}`}
                  aria-hidden="true"
                ></i>
                {notification.message}
              </Alert>
            ))}
          {!notifications && (
            <Alert variant="warning">
              <i
                className={`fa fa-${NotificationType['WARNING']}`}
                aria-hidden="true"
              ></i>
              No notifications.
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
