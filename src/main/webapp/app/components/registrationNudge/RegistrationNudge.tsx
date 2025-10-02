import React, { useState, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import styles from './styles.module.scss';
import classNames from 'classnames';
import WindowStore from 'app/store/WindowStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { useLocation, Link } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';

export function parseCookieNumber(
  cookieHeader: string,
  cookieName: string
): number {
  try {
    const cookies = cookieHeader
      .split(';')
      .map(cookie => cookie.trim())
      .filter(Boolean);
    const match = cookies.find(cookie => cookie.startsWith(`${cookieName}=`));
    if (!match) {
      return 0;
    }
    const separatorIndex = match.indexOf('=');
    if (separatorIndex < 0 || separatorIndex === match.length - 1) {
      return 0;
    }
    const rawValue = match.substring(separatorIndex + 1);
    const decodedValue = decodeURIComponent(rawValue);
    const parsed = Number.parseInt(decodedValue, 10);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  } catch (_error) {
    return 0;
  }
}

function readCookieNumber(cookieName: string): number {
  if (typeof document === 'undefined') {
    return 0;
  }
  return parseCookieNumber(document.cookie, cookieName);
}

function writeCookieNumber(cookieName: string, value: number) {
  if (typeof document === 'undefined') {
    return;
  }
  const safeValue =
    Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  document.cookie = `${cookieName}=${encodeURIComponent(
    safeValue
  )}; Path=/; SameSite=Lax`;
}

function useShouldNudge(isUserAuthenticated: boolean): [boolean, () => void] {
  const pageVisitCountCookie = 'page_visit_count';
  const [shouldNudge, setShouldNudge] = useState(false);
  const [pageVisitCount, setPageVisitCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setPageVisitCount(readCookieNumber(pageVisitCountCookie));
  }, []);

  useEffect(() => {
    writeCookieNumber(pageVisitCountCookie, pageVisitCount);
  }, [pageVisitCount]);

  useEffect(() => {
    if (isUserAuthenticated) {
      setPageVisitCount(0);
    } else {
      setPageVisitCount(num => num + 1);
    }
  }, [location.pathname, isUserAuthenticated]);

  useEffect(() => {
    setShouldNudge(!isUserAuthenticated && pageVisitCount > 10);
  }, [pageVisitCount, isUserAuthenticated]);

  const dismissNudge = useCallback(() => {
    setPageVisitCount(0);
  }, []);

  return [shouldNudge, dismissNudge];
}

type RegistrationNudgeInternalProps = {
  windowStore: WindowStore;
  authStore: AuthenticationStore;
};
export default function RegistrationNudgeInternal({
  windowStore,
  authStore,
}: RegistrationNudgeInternalProps) {
  const [shouldNudge, dismissNudge] = useShouldNudge(
    authStore.isUserAuthenticated
  );
  return shouldNudge ? (
    <div className={classNames(styles.container, 'bg-dark', 'text-white')}>
      <Container fluid={!windowStore.isXLscreen}>
        <div className={classNames(styles.grid)}>
          <i className={classNames('fa', 'fa-bullhorn')}></i>
          <aside>
            <p>
              Enjoying OncoKB?{' '}
              <Link to={PAGE_ROUTE.REGISTER} onClick={dismissNudge}>
                Register
              </Link>{' '}
              for an account to unlock more.
            </p>
          </aside>
          <button className={classNames(styles.close)} onClick={dismissNudge}>
            <i className={classNames('fa', 'fa-close')} />
          </button>
        </div>
      </Container>
    </div>
  ) : null;
}
