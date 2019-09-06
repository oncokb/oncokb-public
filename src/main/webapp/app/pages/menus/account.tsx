import React from 'react';
import NavDropdown from './menu-components';
import MenuItem from 'app/pages/menus/menu-item';
import { observer } from 'mobx-react';

const accountMenuItemsAuthenticated = (
  <>
    <MenuItem icon="wrench" to="/account/settings">
      Settings
    </MenuItem>
    <MenuItem icon="lock" to="/account/password">
      Password
    </MenuItem>
    <MenuItem icon="sign-out-alt" to="/logout">
      Sign out
    </MenuItem>
  </>
);

const accountMenuItems = (
  <>
    <MenuItem id="login-item" icon="sign-in-alt" to="/login">
      Sign in
    </MenuItem>
    <MenuItem icon="sign-in-alt" to="/register">
      Register
    </MenuItem>
  </>
);

export const AccountMenu = ({ isAuthenticated = false }) => (
  <NavDropdown icon="user" name="Account" id="account-menu">
    {isAuthenticated ? accountMenuItemsAuthenticated : accountMenuItems}
  </NavDropdown>
);

export default observer(AccountMenu);
