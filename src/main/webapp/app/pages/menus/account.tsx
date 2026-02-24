import React from 'react';
import MenuItem from 'app/pages/menus/menu-item';
import { inject, observer } from 'mobx-react';
import { Dropdown, NavItem } from 'react-bootstrap';
import NavLink from 'react-bootstrap/NavLink';
import { PAGE_ROUTE, PAGE_TITLE } from 'app/config/constants';
import { UserDTO } from 'app/shared/api/generated/API';
import { RouterStore } from 'mobx-react-router';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { IReactionDisposer, reaction } from 'mobx';
import { getPublicWebsiteToken } from 'app/indexUtils';

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
        <MenuItem icon="building" to={PAGE_ROUTE.ADMIN_COMPANY_DETAILS}>
          {PAGE_TITLE.ADMIN_COMPANY_DETAILS}
        </MenuItem>
        <MenuItem icon="bar-chart" to={PAGE_ROUTE.ADMIN_USAGE_ANALYSIS}>
          {PAGE_TITLE.ADMIN_USAGE_ANALYSIS}
        </MenuItem>
        <MenuItem icon="warning" to={PAGE_ROUTE.ADMIN_USER_BANNER_MESSAGES}>
          {PAGE_TITLE.ADMIN_USER_BANNER_MESSAGES}
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

interface IAccountMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  showAccountText?: boolean;
  account?: UserDTO;
  routing?: RouterStore;
  authenticationStore?: AuthenticationStore;
}

@inject('routing', 'authenticationStore')
@observer
export default class AccountMenu extends React.Component<IAccountMenuProps> {
  private routeDisposer?: IReactionDisposer;

  constructor(props: Readonly<IAccountMenuProps>) {
    super(props);

    if (this.props.routing && this.props.authenticationStore) {
      const routingStore = this.props.routing;
      const authenticationStore = this.props.authenticationStore;
      this.routeDisposer = reaction(
        () => routingStore.location,
        location => {
          // Avoid refetching account during logout route transition
          // It can race with logout and restore authenticated state
          // which will force the user to click logout twice.
          if (location.pathname === PAGE_ROUTE.LOGOUT) {
            return;
          }
          const isLoggedInUser =
            this.props.isAuthenticated &&
            authenticationStore.idToken !== getPublicWebsiteToken();
          if (isLoggedInUser) {
            authenticationStore.getAccount();
          }
        }
      );
    }
  }

  componentWillUnmount() {
    this.routeDisposer?.();
  }

  render() {
    const {
      activated = false,
      activationGracePeriodDaysRemaining: graceDaysRemaining = 0,
    } = this.props.account ?? {};
    const showGraceIndicator =
      this.props.isAuthenticated && !activated && graceDaysRemaining > 0;
    const dayLabel = graceDaysRemaining === 1 ? 'day' : 'days';
    const reviewLicenseText = `We are reviewing your license application. Meanwhile, you can view limited content for ${graceDaysRemaining} ${dayLabel}.`;
    return (
      <Dropdown as={NavItem}>
        <Dropdown.Toggle id={'account-menu'} as={NavLink}>
          <i className={'fa fa-user-o mr-1'} />
          {this.props.showAccountText ? PAGE_TITLE.ACCOUNT : undefined}
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
            <AccountMenuItemsAuthenticated isAdmin={this.props.isAdmin} />
          ) : (
            <AccountMenuItems />
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
