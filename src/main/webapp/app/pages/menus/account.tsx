import React from 'react';
import MenuItem from 'app/pages/menus/menu-item';
import { observer } from 'mobx-react';
import { Dropdown, NavItem } from 'react-bootstrap';
import NavLink from 'react-bootstrap/NavLink';
import { observable } from 'mobx';

const accountMenuItemsAuthenticated = (
  <>
    <MenuItem icon="wrench" to="/account/settings">
      Account Settings
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
    <MenuItem icon="sign-in-alt" to="/account/register">
      Register
    </MenuItem>
  </>
);

@observer
export default class AccountMenu extends React.Component<{ isAuthenticated: boolean }> {
  @observable menuOpened = false;

  render() {
    return (
      <Dropdown as={NavItem}>
        <Dropdown.Toggle id={'account-menu'} as={NavLink} onFocus={() => this.menuOpened = !this.menuOpened}>
          <i className={'fa fa-user mr-1'}/>Account
        </Dropdown.Toggle>
        <Dropdown.Menu show={this.menuOpened}>
          {this.props.isAuthenticated ? accountMenuItemsAuthenticated : accountMenuItems}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
};
