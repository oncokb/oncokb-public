import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import React from 'react';

interface NotificationImplication {
  message: string;
  type: string;
}

interface NotificationProps {
  notifications: NotificationImplication[];
}

export default function Notification({ notifications }: NotificationProps) {
  const [visibleNotifications, setVisibleNotifications] = useState(
    notifications.slice(0, 2)
  );
  const [showAll, setShowAll] = useState(true);

  const handleClose = (message: string) => {
    setVisibleNotifications(
      visibleNotifications.filter(
        notification => notification.message !== message
      )
    );
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
    setVisibleNotifications(
      showAll ? notifications : notifications.slice(0, 2)
    );
  };

  return (
    <div className="flex">
      {notifications.length <= 2 && (
        <div>
          {visibleNotifications.map(notification => (
            <Alert
              key={notification.message}
              variant={notification.type}
              onClose={() => handleClose(notification.message)}
              dismissible
            >
              {notification.message}
            </Alert>
          ))}
        </div>
      )}

      {notifications.length > 2 &&
        (!showAll ? (
          <div>
            {visibleNotifications.map(notification => (
              <Alert
                key={notification.message}
                variant={notification.type}
                onClose={() => handleClose(notification.message)}
                dismissible
              >
                {notification.message}
              </Alert>
            ))}
            <Button
              variant="link"
              onClick={toggleShowAll}
              style={{ float: 'right' }}
            >
              Show less
            </Button>
          </div>
        ) : (
          <div>
            {visibleNotifications.map(notification => (
              <Alert
                key={notification.message}
                variant={notification.type}
                onClose={() => handleClose(notification.message)}
                dismissible
              >
                {notification.message}
              </Alert>
            ))}
            <Button
              variant="link"
              onClick={toggleShowAll}
              style={{ float: 'right' }}
            >
              Show all ({notifications.length})
            </Button>
          </div>
        ))}
    </div>
  );
}
