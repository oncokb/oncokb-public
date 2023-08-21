import React from 'react';
import { Tab, TabPanel, Tabs } from 'react-responsive-tabs';

interface TabsProps {
  files: File[];
}

const TabsComponent: React.FC<TabsProps> = ({ files }) => {
  const tabItems = files.map((file, index) => (
    <Tab key={index} tabTitle={`File ${index + 1}`}>
      <TabPanel>
        <pre>{/* Display file content here */}</pre>
      </TabPanel>
    </Tab>
  ));

  return <Tabs>{tabItems}</Tabs>;
};

export default TabsComponent;
