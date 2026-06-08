import * as React from 'react';
import BSNavLink from 'react-bootstrap/NavLink';
import NavItem from 'react-bootstrap/NavItem';
import { observer } from 'mobx-react';
import { NavLink, useLocation } from 'react-router-dom';
import classnames from 'classnames';
import { PAGE_ROUTE, PAGE_TITLE, USER_AUTHORITY } from 'app/config/constants';

export type SubpagePath = {
  link?: PAGE_ROUTE;
  href?: string;
  title?: string;
  requiredAuthorities?: USER_AUTHORITY[];
};

export type SubpageLink = {
  title: string;
  subPaths: [SubpagePath, ...SubpagePath[]];
};

export type CollapsedNavSubmenuTitle =
  | SubpageLink['title']
  | PAGE_TITLE.ACCOUNT;
export type NavMenuItem = { title: string; link: PAGE_ROUTE };

export const SUB_PAGES: SubpageLink[] = [
  {
    title: 'Levels of Evidence',
    subPaths: [
      { link: PAGE_ROUTE.V2 },
      { link: PAGE_ROUTE.DX },
      { link: PAGE_ROUTE.PX },
      { link: PAGE_ROUTE.FDA_NGS },
    ],
  },
  {
    title: 'Actionable Genes',
    subPaths: [{ link: PAGE_ROUTE.ACTIONABLE_GENE }],
  },
  { title: 'Oncology Therapies', subPaths: [{ link: PAGE_ROUTE.ONCOLOGY_TX }] },
  { title: 'CDx', subPaths: [{ link: PAGE_ROUTE.CDX }] },
  { title: 'Cancer Genes', subPaths: [{ link: PAGE_ROUTE.CANCER_GENES }] },
  {
    title: 'License',
    subPaths: [{ link: PAGE_ROUTE.TERMS }, { link: PAGE_ROUTE.REGISTER }],
  },
  {
    title: 'News',
    subPaths: [
      { link: PAGE_ROUTE.NEWS },
      { link: PAGE_ROUTE.YEAR_END_SUMMARY },
    ],
  },
  {
    title: 'Developer',
    subPaths: [
      { title: 'API Docs', link: PAGE_ROUTE.API_DOCS },
      { title: 'Swagger UI', href: PAGE_ROUTE.SWAGGER_UI },
      {
        title: 'Premium API Docs',
        link: PAGE_ROUTE.PREMIUM_API_DOCS,
        requiredAuthorities: [USER_AUTHORITY.ROLE_PREMIUM_USER],
      },
      {
        title: 'MAF/VCF Annotation',
        href: 'https://github.com/oncokb/oncokb-annotator#usage',
      },
      {
        title: 'Data Download',
        link: PAGE_ROUTE.DATA_DOWNLOAD,
        requiredAuthorities: [USER_AUTHORITY.ROLE_DATA_DOWNLOAD],
      },
    ],
  },
  {
    title: 'About',
    subPaths: [
      { title: 'About', link: PAGE_ROUTE.ABOUT },
      { title: 'Team', link: PAGE_ROUTE.TEAM },
      { title: 'FDA Recognition', link: PAGE_ROUTE.FDA_RECOGNITION },
      { title: 'Standard Operating Procedure', link: PAGE_ROUTE.SOP },
      { title: 'Privacy', link: PAGE_ROUTE.PRIVACY },
      { title: 'FAQ', link: PAGE_ROUTE.FAQ_ACCESS },
    ],
  },
];

export type CollapsedNavSubmenuHandle = {
  open: (title: CollapsedNavSubmenuTitle) => void;
  reset: () => void;
};

type CollapsedNavSubmenuProps = {
  accountItems: NavMenuItem[];
  enableAuth: boolean;
  hasRequiredAuthorities: (authorities?: USER_AUTHORITY[]) => boolean;
  onCollapseNav: () => void;
  children: React.ReactNode;
};

const CollapsedNavSubmenu = observer(
  React.forwardRef<CollapsedNavSubmenuHandle, CollapsedNavSubmenuProps>(
    (
      {
        accountItems,
        enableAuth,
        hasRequiredAuthorities,
        onCollapseNav,
        children,
      },
      ref
    ) => {
      const location = useLocation();
      const [activeTitle, setActiveTitle] = React.useState<
        CollapsedNavSubmenuTitle | undefined
      >(undefined);
      const [isExiting, setIsExiting] = React.useState(false);
      const exitTimeoutRef = React.useRef<number | undefined>(undefined);

      React.useImperativeHandle(ref, () => ({
        open(title) {
          setActiveTitle(title);
        },
        reset() {
          window.clearTimeout(exitTimeoutRef.current);
          setIsExiting(false);
          setActiveTitle(undefined);
        },
      }));

      React.useEffect(
        () => () => window.clearTimeout(exitTimeoutRef.current),
        []
      );

      const handleClose = (event?: React.MouseEvent<HTMLElement>) => {
        event?.preventDefault();
        event?.stopPropagation();
        setIsExiting(true);
        exitTimeoutRef.current = window.setTimeout(() => {
          setIsExiting(false);
          setActiveTitle(undefined);
        }, 200);
      };

      const getFilteredItems = (page: SubpageLink) =>
        page.subPaths.filter(
          (item): item is SubpagePath & { title: string } =>
            !!item.title && hasRequiredAuthorities(item.requiredAuthorities)
        );

      const renderSubmenuPanel = (
        title: string,
        items: (SubpagePath & { title: string })[]
      ) => (
        <div
          className={classnames('collapsed-nav-submenu', {
            exiting: isExiting,
          })}
        >
          <BSNavLink
            className="collapsed-nav-submenu-back"
            onClick={handleClose}
          >
            <i className="fa fa-arrow-left" aria-hidden="true" />
            <span>Home</span>
          </BSNavLink>
          <div className="collapsed-nav-submenu-title">{title}</div>
          {items.map(item =>
            item.href ? (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link collapsed-nav-submenu-link"
                onClick={onCollapseNav}
              >
                {item.title}
                <i className="fa fa-external-link ml-1" />
              </a>
            ) : (
              <NavLink
                to={item.link!}
                key={item.title}
                className="nav-link collapsed-nav-submenu-link"
                activeClassName=""
                onClick={onCollapseNav}
              >
                {item.title}
              </NavLink>
            )
          )}
        </div>
      );

      if (activeTitle === PAGE_TITLE.ACCOUNT) {
        return <>{renderSubmenuPanel(PAGE_TITLE.ACCOUNT, accountItems)}</>;
      }

      const activePage = activeTitle
        ? SUB_PAGES.find(
            page =>
              page.title === activeTitle && getFilteredItems(page).length > 0
          )
        : undefined;

      if (activePage) {
        return (
          <>
            {renderSubmenuPanel(activePage.title, getFilteredItems(activePage))}
          </>
        );
      }

      const accountIsActive = accountItems.some(item =>
        location.pathname.includes(item.link)
      );

      return (
        <>
          {children}
          {enableAuth && (
            <NavItem
              className={classnames('mr-auto nav-item', {
                active: accountIsActive,
              })}
            >
              <BSNavLink
                id="collapsed-nav-account-menu"
                className={accountIsActive ? 'active' : ''}
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveTitle(PAGE_TITLE.ACCOUNT);
                }}
              >
                {PAGE_TITLE.ACCOUNT}
                <i className="fa fa-angle-right fa-lg ml-1" />
              </BSNavLink>
            </NavItem>
          )}
        </>
      );
    }
  )
);

export default CollapsedNavSubmenu;
