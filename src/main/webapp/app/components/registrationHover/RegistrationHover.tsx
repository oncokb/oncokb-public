import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';
import { inject, observer } from 'mobx-react';
import AuthenticationStore from 'app/store/AuthenticationStore';

const REGISTRATION_HOVER_COOKIE = 'registration_hover_count';
const REGISTRATION_HOVER_THRESHOLD = 10;
const REGISTRATION_HOVER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

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
  )}; Path=/; Max-Age=${REGISTRATION_HOVER_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function useRegistrationHoverCookieCount(
  pathName: string,
  isUserAuthenticated: boolean
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(readCookieNumber(REGISTRATION_HOVER_COOKIE));
  }, []);

  useEffect(() => {
    writeCookieNumber(REGISTRATION_HOVER_COOKIE, count);
  }, [count]);

  useEffect(() => {
    if (!pathName.startsWith('/gene')) {
      return;
    }

    if (isUserAuthenticated) {
      setCount(0);
    } else {
      setCount(num => num + 1);
    }
  }, [pathName, isUserAuthenticated]);

  return count;
}

type RegistrationHoverProps = {
  authenticationStore: AuthenticationStore;
};

export default function RegistrationHover({
  authenticationStore,
}: RegistrationHoverProps) {
  const location = useLocation();
  const cookieCount = useRegistrationHoverCookieCount(
    location.pathname,
    authenticationStore.isUserAuthenticated
  );
  const shouldShow =
    !authenticationStore.isUserAuthenticated &&
    cookieCount > REGISTRATION_HOVER_THRESHOLD;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const { body } = document;
    if (!body) {
      return;
    }
    const previousOverflow = body.style.overflow;
    if (shouldShow) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = previousOverflow ?? '';
    }
    return () => {
      body.style.overflow = previousOverflow ?? '';
    };
  }, [shouldShow]);

  if (!shouldShow) {
    return <></>;
  } else {
    const content = {
      title: 'Thanks for using OncoKB!',
      body:
        'Help us grow by creating an account or logging in to continue accessing our evidence-based precision oncology content',
      button: 'Register Now',
    };

    return (
      <dialog className={classNames(styles.registerDialog)} open={shouldShow}>
        <div className={classNames('text-center', 'text-muted', 'mb-3')}>
          <p>
            This curated data requires you to create an account to get full
            access
          </p>
          <div className={classNames(styles.headlineRule)}></div>
        </div>
        <div className={classNames(styles.registerContent)}>
          <div>
            <p className="h4 mb-3 fw-semibold">{content.title}</p>
            <small className="text-muted d-block">{content.body}</small>
          </div>
          <div className={styles.linkColumn}>
            <Link
              className={classNames(styles.registerLink, 'btn', 'btn-primary')}
              to={PAGE_ROUTE.REGISTER}
            >
              {content.button}
            </Link>
            <Link to={PAGE_ROUTE.LOGIN}>Already have an account? Log In</Link>
          </div>
        </div>
      </dialog>
    );
  }
}
