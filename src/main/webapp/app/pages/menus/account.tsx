import React from 'react';
import MenuItem from 'app/pages/menus/menu-item';
import { observer } from 'mobx-react';
import { Dropdown, NavItem } from 'react-bootstrap';
import NavLink from 'react-bootstrap/NavLink';
import { PAGE_ROUTE, PAGE_TITLE } from 'app/config/constants';

const AccountMenuItemsAuthenticated: React.FunctionComponent<{
  isAdmin: boolean;
}> = props => (
  <>
    <MenuItem icon="wrench" to={PAGE_ROUTE.ACCOUNT_SETTINGS}>
      {PAGE_TITLE.ACCOUNT_SETTINGS}
    </MenuItem>
    <MenuItem icon="lock" to={PAGE_ROUTE.ACCOUNT_PASSWORD}>
      {PAGE_TITLE.ACCOUNT_PASSWORD}
    </MenuItem>
    {props.isAdmin ? (
      <>
        <MenuItem icon="id-card-o" to={PAGE_ROUTE.ADMIN_USER_DETAILS}>
          {PAGE_TITLE.ADMIN_USER_DETAILS}
        </MenuItem>
        <MenuItem icon="envelope" to={PAGE_ROUTE.ADMIN_SEND_EMAILS}>
          {PAGE_TITLE.ADMIN_SEND_EMAILS}
        </MenuItem>
        <MenuItem icon="user-plus" to={PAGE_ROUTE.ADMIN_CREATE_ACCOUNT}>
          {PAGE_TITLE.ADMIN_CREATE_ACCOUNT}
        </MenuItem>
        <MenuItem icon="file-text" to={PAGE_ROUTE.ADMIN_ADD_COMPANY}>
          {PAGE_TITLE.ADMIN_ADD_COMPANY}
        </MenuItem>
        <MenuItem icon="bar-chart" to={PAGE_ROUTE.ADMIN_USAGE_ANALYSIS}>
          {PAGE_TITLE.ADMIN_USAGE_ANALYSIS}
        </MenuItem>
      </>
    ) : null}
    <MenuItem icon="sign-out" to={PAGE_ROUTE.LOGOUT}>
      {PAGE_TITLE.LOGOUT}
    </MenuItem>
  </>
);

const AccountMenuItems: React.FunctionComponent<{}> = () => (
  <>
    <MenuItem id="login-item" icon="sign-in" to={PAGE_ROUTE.LOGIN}>
      {PAGE_TITLE.LOGIN}
    </MenuItem>
    <MenuItem icon="sign-in" to={PAGE_ROUTE.REGISTER}>
      {PAGE_TITLE.REGISTER}
    </MenuItem>
  </>
);

@observer
export default class AccountMenu extends React.Component<{
  isAuthenticated: boolean;
  isAdmin: boolean;
}> {
  render() {
    return (
      <Dropdown as={NavItem}>
        <Dropdown.Toggle id={'account-menu'} as={NavLink}>
          <i className={'fa fa-user mr-1'} />
          {PAGE_TITLE.ACCOUNT}
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight={true}>
          {this.props.isAuthenticated ? (
            <AccountMenuItemsAuthenticated isAdmin={this.props.isAdmin} />
          ) : (
            <AccountMenuItems />
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
