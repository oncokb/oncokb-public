import React from 'react';
import { NavDropdown } from './menu-components';
import MenuItem from 'app/pages/menus/menu-item';

const adminMenuItems = (
  <>
    <MenuItem icon="user" to="/admin/user-management">
      User management
    </MenuItem>
    <MenuItem icon="tachometer-alt" to="/admin/metrics">
      Metrics
    </MenuItem>
    <MenuItem icon="heart" to="/admin/health">
      Health
    </MenuItem>
    <MenuItem icon="list" to="/admin/configuration">
      Configuration
    </MenuItem>
    <MenuItem icon="bell" to="/admin/audits">
      Audits
    </MenuItem>
    {/* jhipster-needle-add-element-to-admin-menu - JHipster will add entities to the admin menu here */}
    <MenuItem icon="tasks" to="/admin/logs">
      Logs
    </MenuItem>
  </>
);

const swaggerItem = (
  <MenuItem icon="book" to="/admin/docs">
    API
  </MenuItem>
);

export const AdminMenu = ({ showSwagger }) => (
  <NavDropdown icon="user-plus" name="Administration" style={{ width: '140%' }} id="admin-menu">
    {adminMenuItems}
    {showSwagger && swaggerItem}
  </NavDropdown>
);

export default AdminMenu;
