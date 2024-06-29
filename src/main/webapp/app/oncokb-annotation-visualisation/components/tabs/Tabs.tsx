import React, { useState, ReactElement } from 'react';
import { TabProps } from './Tab';
import './styles.scss';
import Notifications from './../notifications/notifications';
import { NotificationImplication } from './../../config/constants';
import { COLOR_GREY } from './../../config/theme';
interface TabsProps {
  children: ReactElement<TabProps>[];
  defaultActiveKey: string;
  id?: string;
  className?: string;
  lastUpdate?: string;
  dataVersion?: string;
  notifications?: NotificationImplication[];
}

const Tabs: React.FC<TabsProps> = ({
  children,
  defaultActiveKey,
  id,
  className,
  lastUpdate,
  dataVersion,
  notifications,
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  const handleTabClick = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div id={id} className={`oncokb-tabs-container ${className || ''}`}>
      <div className="oncokb-tab-headers">
        <div className="oncokb-tab-header-left">
          {React.Children.map(children, child => (
            <div
              className={`header-left-child ${
                child.props.eventKey === activeKey ? 'active' : ''
              }`}
              onClick={() => handleTabClick(child.props.eventKey)}
              style={{ color: 'black' }}
            >
              {child.props.title}
            </div>
          ))}
        </div>
        <div className="oncokb-tab-header-right">
          <div className="data-info">
            <div>Annotation based on {dataVersion || 'NA'}</div>
            <div>Updated on {lastUpdate || 'NA'}</div>
          </div>
          <div className="oncokb-download-button">
            <i
              className="fa fa-download fa-lg fa-download-color"
              aria-hidden="true"
            ></i>
          </div>
          <div>
            <Notifications notifications={notifications || []} />
          </div>
        </div>
      </div>
      <div className="oncokb-tab-content">
        {React.Children.map(children, child =>
          child.props.eventKey === activeKey ? child.props.children : null
        )}
      </div>
    </div>
  );
};

export default Tabs;
