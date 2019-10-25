import React from 'react';
import MenuItem from 'app/pages/menus/menu-item';
import { observer } from 'mobx-react';
import { Dropdown, NavItem } from 'react-bootstrap';
import NavLink from 'react-bootstrap/NavLink';
import { PAGE_ROUTE } from 'app/config/constants';

const AccountMenuItemsAuthenticated: React.FunctionComponent<{
  isAdmin: boolean
}> = (props) => (
  <>
    <MenuItem icon="wrench" to={PAGE_ROUTE.ACCOUNT_SETTINGS}>
      Account Settings
    </MenuItem>
    <MenuItem icon="lock" to={PAGE_ROUTE.ACCOUNT_PASSWORD}>
      Change Password
    </MenuItem>
    {props.isAdmin ? (
      <MenuItem icon="users" to={PAGE_ROUTE.ADMIN_USER_MANAGEMENT}>
        Manage Users
      </MenuItem>
    ) : null}
    <MenuItem icon="sign-out" to={PAGE_ROUTE.LOGOUT}>
      Sign out
    </MenuItem>
  </>
);

const AccountMenuItems: React.FunctionComponent<{}> = () => (
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
export default class AccountMenu extends React.Component<{
  isAuthenticated: boolean,
  isAdmin: boolean
}> {
  render() {
    return (
      <Dropdown as={NavItem}>
        <Dropdown.Toggle id={'account-menu'} as={NavLink}>
          <i className={'fa fa-user mr-1'}/>
          Account
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight={true}>
          {this.props.isAuthenticated ? <AccountMenuItemsAuthenticated isAdmin={this.props.isAdmin}/> :
            <AccountMenuItems/>}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
