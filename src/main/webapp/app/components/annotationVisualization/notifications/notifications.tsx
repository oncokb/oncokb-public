import React, { useState } from 'react';
import Alert from './../alert/Alert';
import './styles.scss';

interface NotificationImplication {
  message: string;
  type: 'danger' | 'primary' | 'warning' | 'success';
}

interface NotificationProps {
  notifications: NotificationImplication[];
}

const Notification: React.FC<NotificationProps> = ({ notifications }) => {
  const [show, setShow] = useState(false);
  const [showNotificationsCount, setShowNotificationsCount] = useState(true);

  const toggleShow = () => {
    setShow(!show);
    if (showNotificationsCount) setShowNotificationsCount(false);
  };

  return (
    <div className="notification-container">
      <div className="notification-icon-container" onClick={toggleShow}>
        <i
          className="fa fa-bell fa-lg notification-icon"
          data-testid="notification-icon"
          aria-hidden="true"
        >
          {showNotificationsCount && (
            <span className="notification-badge">
              {notifications.length > 10 ? '10+' : notifications.length}
            </span>
          )}
        </i>
      </div>
      {show && (
        <div
          className="notification-dropdown"
          data-testid="notification-dropdown"
        >
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <Alert notification={notification} key={index} />
            ))
          ) : (
            <Alert notification={{ message: 'No Messages', type: 'warning' }} />
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
