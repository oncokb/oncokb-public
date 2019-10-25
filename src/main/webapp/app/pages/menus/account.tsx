import React from 'react';
import MenuItem from 'app/pages/menus/menu-item';
import { observer } from 'mobx-react';
import { Dropdown, NavItem } from 'react-bootstrap';
import NavLink from 'react-bootstrap/NavLink';

const accountMenuItemsAuthenticated = (
  <>
    <MenuItem icon="wrench" to="/account/settings">
      Account Settings
    </MenuItem>
    <MenuItem icon="lock" to="/account/password">
      Change Password
    </MenuItem>
    <MenuItem icon="sign-out" to="/logout">
      Sign out
    </MenuItem>
  </>
);

const accountMenuItems = (
  <>
    <MenuItem id="login-item" icon="sign-in" to="/login">
      Sign in
    </MenuItem>
    <MenuItem icon="sign-in" to="/account/register">
      Register
    </MenuItem>
  </>
);

@observer
export default class AccountMenu extends React.Component<{ isAuthenticated: boolean }> {
  render() {
    return (
      <Dropdown as={NavItem}>
        <Dropdown.Toggle id={'account-menu'} as={NavLink}>
          <i className={'fa fa-user mr-1'} />
          Account
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight={true}>
          {this.props.isAuthenticated ? accountMenuItemsAuthenticated : accountMenuItems}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
