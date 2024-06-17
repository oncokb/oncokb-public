import React, { useState, ReactElement } from 'react';
import { TabProps } from './Tab';
import './styles.scss';

interface TabsProps {
  children: ReactElement<TabProps>[];
  defaultActiveKey: string;
  id?: string;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  children,
  defaultActiveKey,
  id,
  className,
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  const handleTabClick = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div id={id} className={className}>
      <div className="tab-headers">
        {React.Children.map(children, child => (
          <div
            className={`tab-header ${
              child.props.eventKey === activeKey ? 'active' : ''
            }`}
            onClick={() => handleTabClick(child.props.eventKey)}
          >
            {child.props.title}
          </div>
        ))}
      </div>
      <div className="tab-content">
        {React.Children.map(children, child =>
          child.props.eventKey === activeKey ? child.props.children : null
        )}
      </div>
    </div>
  );
};

export default Tabs;
