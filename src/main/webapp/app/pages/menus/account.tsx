import React from 'react';
import MenuItem from 'app/pages/menus/menu-item';
import { observer } from 'mobx-react';
import { Dropdown, NavItem } from 'react-bootstrap';
import NavLink from 'react-bootstrap/NavLink';
import { PAGE_ROUTE, PAGE_TITLE } from 'app/config/constants';
import {
  getGracePeriodDaysRemaining,
  hasGracePeriodAccess,
} from 'app/shared/utils/GracePeriodUtils';
import { getLoginRouteForRegister } from 'app/shared/utils/UrlUtils';
import AuthenticationStore from 'app/store/AuthenticationStore';

const AccountMenuItemsAuthenticated: React.FunctionComponent<{
  authStore: AuthenticationStore;
  isAdmin: boolean;
  onItemClick: () => void;
}> = props => (
  <>
    <MenuItem
      icon="wrench"
      to={PAGE_ROUTE.ACCOUNT_SETTINGS}
      onClick={props.onItemClick}
    >
      {PAGE_TITLE.ACCOUNT_SETTINGS}
    </MenuItem>
    {!props.authStore.isMskUser && (
      <MenuItem
        icon="lock"
        to={PAGE_ROUTE.ACCOUNT_PASSWORD}
        onClick={props.onItemClick}
      >
        {PAGE_TITLE.ACCOUNT_PASSWORD}
      </MenuItem>
    )}
    {props.isAdmin ? (
      <>
        <MenuItem
          icon="id-card-o"
          to={PAGE_ROUTE.ADMIN_USER_DETAILS}
          onClick={props.onItemClick}
        >
          {PAGE_TITLE.ADMIN_USER_DETAILS}
        </MenuItem>
        <MenuItem
          icon="envelope"
          to={PAGE_ROUTE.ADMIN_SEND_EMAILS}
          onClick={props.onItemClick}
        >
          {PAGE_TITLE.ADMIN_SEND_EMAILS}
        </MenuItem>
        <MenuItem
          icon="user-plus"
          to={PAGE_ROUTE.ADMIN_CREATE_ACCOUNT}
          onClick={props.onItemClick}
        >
          {PAGE_TITLE.ADMIN_CREATE_ACCOUNT}
        </MenuItem>
        <MenuItem
          icon="building"
          to={PAGE_ROUTE.ADMIN_COMPANY_DETAILS}
          onClick={props.onItemClick}
        >
          {PAGE_TITLE.ADMIN_COMPANY_DETAILS}
        </MenuItem>
        <MenuItem
          icon="bar-chart"
          to={PAGE_ROUTE.ADMIN_USAGE_ANALYSIS}
          onClick={props.onItemClick}
        >
          {PAGE_TITLE.ADMIN_USAGE_ANALYSIS}
        </MenuItem>
        <MenuItem
          icon="warning"
          to={PAGE_ROUTE.ADMIN_USER_BANNER_MESSAGES}
          onClick={props.onItemClick}
        >
          {PAGE_TITLE.ADMIN_USER_BANNER_MESSAGES}
        </MenuItem>
      </>
    ) : null}
    <MenuItem
      icon="sign-out"
      to={PAGE_ROUTE.LOGOUT}
      onClick={props.onItemClick}
    >
      {PAGE_TITLE.LOGOUT}
    </MenuItem>
  </>
);

const AccountMenuItems: React.FunctionComponent<{
  onItemClick: () => void;
}> = props => (
  <>
    <MenuItem
      id="login-item"
      icon="sign-in"
      to={PAGE_ROUTE.LOGIN}
      onClick={props.onItemClick}
    >
      {PAGE_TITLE.LOGIN}
    </MenuItem>
    <MenuItem
      icon="sign-in"
      to={getLoginRouteForRegister()}
      onClick={props.onItemClick}
    >
      {PAGE_TITLE.REGISTER}
    </MenuItem>
  </>
);

interface IAccountMenuProps {
  authStore: AuthenticationStore;
  isAuthenticated: boolean;
  isAdmin: boolean;
  showAccountText?: boolean;
  onMenuItemClick?: () => void;
}

@observer
export default class AccountMenu extends React.Component<IAccountMenuProps> {
  state = {
    isOpen: false,
  };

  private closeTimeout: number | undefined;

  componentWillUnmount() {
    window.clearTimeout(this.closeTimeout);
  }

  handleToggle = (isOpen: boolean) => {
    this.setState({ isOpen });
  };

  handleMouseEnter = () => {
    window.clearTimeout(this.closeTimeout);
    this.setState({ isOpen: true });
  };

  handleMouseLeave = () => {
    this.closeTimeout = window.setTimeout(
      () => this.setState({ isOpen: false }),
      200
    );
  };

  handleItemClick = () => {
    this.setState({ isOpen: false });
    this.props.onMenuItemClick?.();
  };

  render() {
    const graceDaysRemaining = getGracePeriodDaysRemaining(
      this.props.authStore.account
    );
    const showGraceIndicator =
      this.props.isAuthenticated &&
      hasGracePeriodAccess(this.props.authStore.account) &&
      this.props.authStore.account?.licenseType !== 'HOSPITAL' &&
      this.props.authStore.account?.licenseType !== 'ACADEMIC';
    const dayLabel = graceDaysRemaining === 1 ? 'day' : 'days';
    const reviewLicenseText = `We are reviewing your license application. Meanwhile, you can view limited content for ${graceDaysRemaining} ${dayLabel}.`;
    return (
      <Dropdown
        as={NavItem}
        show={this.state.isOpen}
        onToggle={this.handleToggle}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <Dropdown.Toggle id={'account-menu'} as={NavLink}>
          <i className={'fa fa-user-o mr-1'} />
          {this.props.showAccountText ? PAGE_TITLE.ACCOUNT : undefined}
          <i
            className={`fa fa-angle-down fa-lg ml-1 account-menu-chevron${
              this.state.isOpen ? ' open' : ''
            }`}
          />
          {showGraceIndicator && (
            <i
              className="fa fa-exclamation-circle text-warning ml-1"
              title={reviewLicenseText}
            />
          )}
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight={true}>
          {showGraceIndicator && (
            <>
              <Dropdown.ItemText
                className="small text-dark px-3 py-2"
                style={{
                  borderLeft: '4px solid #f0ad4e',
                  backgroundColor: '#fff8e5',
                }}
              >
                <p style={{ lineHeight: '1.5rem', marginBottom: '0rem' }}>
                  {reviewLicenseText}
                </p>
              </Dropdown.ItemText>
              <Dropdown.Divider />
            </>
          )}
          {this.props.isAuthenticated ? (
            <AccountMenuItemsAuthenticated
              authStore={this.props.authStore}
              isAdmin={this.props.isAdmin}
              onItemClick={this.handleItemClick}
            />
          ) : (
            <AccountMenuItems onItemClick={this.handleItemClick} />
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
