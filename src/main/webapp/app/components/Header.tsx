import * as React from 'react';
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap';
import BSNavLink from 'react-bootstrap/NavLink';
import NavItem from 'react-bootstrap/NavItem';
import oncokbImg from 'oncokb-styles/dist/images/logo/oncokb-white.svg';
import { observer } from 'mobx-react';
import WindowStore from 'app/store/WindowStore';
import { RouterStore } from 'mobx-react-router';
import { withRouter, RouteComponentProps } from 'react-router';
import { NavLink } from 'react-router-dom';
import CollapsedNavSubmenu, {
  CollapsedNavSubmenuHandle,
  NavMenuItem,
  SubpagePath,
  SubpageLink,
  SUB_PAGES,
} from './CollapsedNavSubmenu';
import AccountMenu from 'app/pages/menus/account';
import { action, IReactionDisposer, observable, reaction } from 'mobx';
import {
  MSK_LOGO_ICON_CUTOFF,
  ONCOKB_TM,
  PAGE_ROUTE,
  PAGE_TITLE,
  USER_AUTHORITY,
} from 'app/config/constants';
import UserMessage from 'app/components/userMessager/UserMessage';
import OncoKBSearch from 'app/components/oncokbSearch/OncoKBSearch';
import classnames from 'classnames';
import autobind from 'autobind-decorator';
import AuthenticationStore from 'app/store/AuthenticationStore';
import AccountMessage from 'app/components/accountMessage/AccountMessage';
import MskccLogo from 'app/components/MskccLogo';
import AppStore from 'app/store/AppStore';
import OptimizedImage from 'app/shared/image/OptimizedImage';
import { AppConfig } from 'app/appConfig';
import { Location } from 'history';
import { getPublicWebsiteToken } from 'app/indexUtils';
import RegistrationNudge from './registrationNudge/RegistrationNudge';

export interface IHeaderProps extends Partial<RouteComponentProps> {
  isUserAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isSwaggerEnabled: boolean;
  windowStore: WindowStore;
  authStore: AuthenticationStore;
  routing: RouterStore;
  appStore: AppStore;
}

const COLLAPSED_NAV_ADMIN_ACCOUNT_ITEMS: NavMenuItem[] = [
  {
    title: PAGE_TITLE.ADMIN_USER_DETAILS,
    link: PAGE_ROUTE.ADMIN_USER_DETAILS,
  },
  {
    title: PAGE_TITLE.ADMIN_SEND_EMAILS,
    link: PAGE_ROUTE.ADMIN_SEND_EMAILS,
  },
  {
    title: PAGE_TITLE.ADMIN_CREATE_ACCOUNT,
    link: PAGE_ROUTE.ADMIN_CREATE_ACCOUNT,
  },
  {
    title: PAGE_TITLE.ADMIN_COMPANY_DETAILS,
    link: PAGE_ROUTE.ADMIN_COMPANY_DETAILS,
  },
  {
    title: PAGE_TITLE.ADMIN_USAGE_ANALYSIS,
    link: PAGE_ROUTE.ADMIN_USAGE_ANALYSIS,
  },
  {
    title: PAGE_TITLE.ADMIN_USER_BANNER_MESSAGES,
    link: PAGE_ROUTE.ADMIN_USER_BANNER_MESSAGES,
  },
];

const checkIfNavLinkIsActive = (
  title: string,
  location: Location,
  subPages: SubpageLink[]
) => {
  const currentPage = subPages.find(page => page.title === title);
  if (!currentPage) return false;
  return currentPage.subPaths.some(
    item => item.link && location.pathname.includes(item.link)
  );
};

// @ts-ignore
@withRouter
@observer
class Header extends React.Component<IHeaderProps> {
  private collapsedNavSubmenuRef = React.createRef<CollapsedNavSubmenuHandle>();

  @observable isNavExpanded = false;
  @observable searchBarIsHovered = false;
  @observable openDropdownTitle: string | undefined;
  private pendingTimers = new Set<number>();
  private routeDisposer?: IReactionDisposer;

  private scheduleTimeout(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.pendingTimers.delete(id);
      fn();
    }, ms);
    this.pendingTimers.add(id);
    return id;
  }

  private clearTimeout(id: number | undefined) {
    if (id !== undefined) {
      window.clearTimeout(id);
      this.pendingTimers.delete(id);
    }
  }

  private clearAllTimeouts() {
    this.pendingTimers.forEach(id => window.clearTimeout(id));
    this.pendingTimers.clear();
  }

  private hasRequiredAuthorities(requiredAuthorities?: USER_AUTHORITY[]) {
    if (!requiredAuthorities?.length) {
      return true;
    }
    const userAuthorities = this.props.authStore.account?.authorities ?? [];
    return requiredAuthorities.every(authority =>
      userAuthorities.includes(authority)
    );
  }

  private get isNonLargeScreen() {
    return !this.props.windowStore.isLargeScreen;
  }

  private get collapsedNavAccountItems() {
    if (this.props.isUserAuthenticated) {
      return [
        {
          title: PAGE_TITLE.ACCOUNT_SETTINGS,
          link: PAGE_ROUTE.ACCOUNT_SETTINGS,
        },
        {
          title: PAGE_TITLE.ACCOUNT_PASSWORD,
          link: PAGE_ROUTE.ACCOUNT_PASSWORD,
        },
        ...(this.props.isAdmin ? COLLAPSED_NAV_ADMIN_ACCOUNT_ITEMS : []),
        { title: PAGE_TITLE.LOGOUT, link: PAGE_ROUTE.LOGOUT },
      ];
    }
    return [
      { title: PAGE_TITLE.LOGIN, link: PAGE_ROUTE.LOGIN },
      { title: PAGE_TITLE.REGISTER, link: PAGE_ROUTE.REGISTER },
    ];
  }

  componentDidMount() {
    this.routeDisposer = reaction(
      () => this.props.routing.location,
      location => {
        // Avoid refetching account during logout route transition.
        if (location.pathname === PAGE_ROUTE.LOGOUT) {
          return;
        }
        const isLoggedInUser =
          this.props.isUserAuthenticated &&
          this.props.authStore.idToken !== getPublicWebsiteToken();
        if (isLoggedInUser) {
          this.props.authStore.getAccount();
        }
      }
    );
  }

  componentWillUnmount() {
    this.routeDisposer?.();
    this.clearAllTimeouts();
  }

  @action.bound
  closeHeaderDropdowns() {
    this.openDropdownTitle = undefined;
  }

  @action.bound
  collapseNav() {
    this.collapsedNavSubmenuRef.current?.reset();
    this.isNavExpanded = false;
  }

  @action.bound
  toggleNav() {
    this.collapsedNavSubmenuRef.current?.reset();
    this.isNavExpanded = !this.isNavExpanded;
  }

  @action
  closeNav(event: any) {
    if (this.isNonLargeScreen) {
      const target = event.target as HTMLElement | null;
      const isCollapsedNavSubmenuInteraction = !!target?.closest(
        '.collapsed-nav-submenu'
      );
      if (!isCollapsedNavSubmenuInteraction) {
        this.collapseNav();
      }
    }
  }

  private dropdownCloseTimerId: number | undefined;

  handleMenuEnter = (title: string) => {
    this.clearTimeout(this.dropdownCloseTimerId);
    this.openDropdownTitle = title;
  };

  handleMenuLeave = () => {
    this.dropdownCloseTimerId = this.scheduleTimeout(
      action(() => (this.openDropdownTitle = undefined)),
      200
    );
  };

  handleMenuToggle = (title: string, isOpen: boolean) => {
    this.openDropdownTitle = isOpen ? title : undefined;
  };

  handleMenuClick = (
    page: SubpageLink,
    event: React.MouseEvent<HTMLElement>
  ) => {
    if (this.isNonLargeScreen) {
      event.preventDefault();
      event.stopPropagation();
      this.collapsedNavSubmenuRef.current?.open(page.title);
      return;
    }

    event.preventDefault();
    this.closeHeaderDropdowns();
    this.props.routing.history.push(page.subPaths[0]?.link!);
  };

  getDropdownItems(page: SubpageLink) {
    return page.subPaths.filter(
      (item): item is SubpagePath & { title: string } =>
        !!item.title && this.hasRequiredAuthorities(item.requiredAuthorities)
    );
  }

  // Renders a dropdown if the page has visible sub-pages, otherwise a plain nav link.
  renderNavItem(page: SubpageLink) {
    const pageLink = page.subPaths[0]?.link;
    const dropdownItems = this.getDropdownItems(page);
    if (dropdownItems.length > 0) {
      const isActive = checkIfNavLinkIsActive(
        page.title,
        this.props.location!,
        SUB_PAGES
      );
      return (
        <NavDropdownItem
          key={page.title}
          page={page}
          dropdownItems={dropdownItems}
          isActive={isActive}
          isOpen={this.openDropdownTitle === page.title}
          isCollapsed={this.isNonLargeScreen}
          onEnter={() => this.handleMenuEnter(page.title)}
          onLeave={() => this.handleMenuLeave()}
          onToggle={(isOpen: boolean) =>
            this.handleMenuToggle(page.title, isOpen)
          }
          onClick={(event: React.MouseEvent<HTMLElement>) =>
            this.handleMenuClick(page, event)
          }
          onItemClick={() => {
            this.closeHeaderDropdowns();
            this.isNavExpanded = false;
          }}
        />
      );
    }
    return (
      <NavLink
        to={pageLink!}
        key={page.title}
        className={'mr-auto nav-item d-flex align-items-center'}
        isActive={(match, location) =>
          !!(match || checkIfNavLinkIsActive(page.title, location, SUB_PAGES))
        }
      >
        {page.title}
      </NavLink>
    );
  }

  renderMainNav() {
    if (this.isNonLargeScreen) {
      return (
        <CollapsedNavSubmenu
          ref={this.collapsedNavSubmenuRef}
          accountItems={this.collapsedNavAccountItems}
          enableAuth={AppConfig.serverConfig.enableAuth}
          hasRequiredAuthorities={requiredAuthorities =>
            this.hasRequiredAuthorities(requiredAuthorities)
          }
          onCollapseNav={this.collapseNav}
        >
          {SUB_PAGES.map(page => this.renderNavItem(page))}
        </CollapsedNavSubmenu>
      );
    }
    return SUB_PAGES.map(page => this.renderNavItem(page));
  }

  renderSearchBar() {
    if (this.isNavExpanded) return null;

    if (this.searchBarIsHovered) {
      return (
        <span
          className={classnames('position-relative', 'nav-item')}
          onMouseEnter={this.enterSearchBar}
          onMouseLeave={this.leaveSearchBar}
          onBlur={this.leaveSearchBar}
        >
          <span
            className={'position-absolute'}
            style={{ width: 500, right: 0, color: 'black' }}
          >
            <OncoKBSearch infoIconClassName="text-white" />
          </span>
        </span>
      );
    }

    return (
      <Nav.Item
        onMouseEnter={this.enterSearchBar}
        onMouseLeave={this.leaveSearchBar}
        onBlur={this.leaveSearchBar}
      >
        <i className={'fa fa-search'} />
      </Nav.Item>
    );
  }

  private searchBarTimerId: number | undefined;

  @autobind
  @action
  updateSearchBarHover(status: boolean, timeout: number) {
    this.clearTimeout(this.searchBarTimerId);
    this.searchBarTimerId = this.scheduleTimeout(
      () => (this.searchBarIsHovered = status),
      timeout
    );
  }

  @autobind
  @action
  enterSearchBar() {
    this.updateSearchBarHover(true, 100);
  }

  @autobind
  @action
  leaveSearchBar() {
    this.updateSearchBarHover(false, 500);
  }

  public render() {
    return (
      <>
        <UserMessage
          windowStore={this.props.windowStore}
          show={true}
          appStore={this.props.appStore}
        />
        <AccountMessage
          windowStore={this.props.windowStore}
          authStore={this.props.authStore}
        />
        <header className="sticky-top header">
          <RegistrationNudge
            windowStore={this.props.windowStore}
            authStore={this.props.authStore}
          />
          <Navbar
            bg="oncokb"
            expand="lg"
            className="navbar-dark main-navbar"
            expanded={this.isNavExpanded}
          >
            <Container fluid={this.isNonLargeScreen}>
              <Navbar.Brand>
                <NavLink to={PAGE_ROUTE.HOME}>
                  <OptimizedImage height={30} src={oncokbImg} alt={ONCOKB_TM} />
                </NavLink>
              </Navbar.Brand>
              <Navbar.Toggle onClick={this.toggleNav} />
              <Navbar.Collapse onClick={(event: any) => this.closeNav(event)}>
                <Nav className="mr-auto">{this.renderMainNav()}</Nav>
                <Nav>
                  {this.renderSearchBar()}
                  {AppConfig.serverConfig.enableAuth && !this.isNonLargeScreen && (
                    <AccountMenu
                      isAuthenticated={this.props.isUserAuthenticated}
                      isAdmin={this.props.isAdmin}
                      showAccountText={this.props.windowStore.isXLscreen}
                      account={this.props.authStore.account}
                      onMenuItemClick={() => {
                        this.isNavExpanded = false;
                      }}
                    />
                  )}
                  <Nav.Item style={{ paddingRight: 0 }}>
                    <MskccLogo
                      imageHeight={35}
                      size={
                        this.props.windowStore.isLargeScreen &&
                        this.props.windowStore.size.width <=
                          MSK_LOGO_ICON_CUTOFF
                          ? 'sm'
                          : 'lg'
                      }
                    />
                  </Nav.Item>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
      </>
    );
  }
}

export default Header;

type NavDropdownItemProps = {
  page: SubpageLink;
  dropdownItems: (SubpagePath & { title: string })[];
  isActive: boolean;
  isOpen: boolean;
  isCollapsed: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onToggle: (isOpen: boolean) => void;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  onItemClick: () => void;
};

function NavDropdownItem({
  page,
  dropdownItems,
  isActive,
  isOpen,
  isCollapsed,
  onEnter,
  onLeave,
  onToggle,
  onClick,
  onItemClick,
}: NavDropdownItemProps) {
  const menuId = `${page.title.toLowerCase().replace(/\s+/g, '-')}-menu`;

  if (isCollapsed) {
    return (
      <NavItem className={classnames('mr-auto nav-item', { active: isActive })}>
        <BSNavLink
          id={menuId}
          className={isActive ? 'active' : ''}
          onClick={onClick}
        >
          {page.title}
          <i className="fa fa-angle-right fa-lg ml-1" />
        </BSNavLink>
      </NavItem>
    );
  }

  return (
    <Dropdown
      as={NavItem}
      show={isOpen}
      onToggle={onToggle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={classnames('mr-auto d-flex align-items-center', {
        active: isActive,
      })}
    >
      <Dropdown.Toggle
        id={menuId}
        as={BSNavLink}
        className={isActive ? 'active' : ''}
        onClick={onClick}
      >
        {page.title}
        <i
          className={`fa fa-angle-down fa-lg ml-1 account-menu-chevron${
            isOpen ? ' open' : ''
          }`}
        />
      </Dropdown.Toggle>
      <Dropdown.Menu className="header-dropdown-menu">
        {dropdownItems.map(item =>
          item.href ? (
            <Dropdown.Item
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onItemClick}
            >
              {item.title}
              <i className="fa fa-external-link ml-1" />
            </Dropdown.Item>
          ) : (
            <Dropdown.Item
              key={item.title}
              as={NavLink}
              to={item.link!}
              activeClassName=""
              onClick={onItemClick}
            >
              {item.title}
            </Dropdown.Item>
          )
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
