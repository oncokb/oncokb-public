import React, { useContext, useEffect } from 'react';
import { StickyMiniNavBarContext } from './StickyMiniNavBar';
import classnames from 'classnames';
import ComingSoonTag from 'app/components/tag/ComingSoonTag';

type IMiniNavBarHeader = {
  id: string;
  children: React.ReactNode;
  className?: string;
  showOnPage?: boolean;
  comingSoon?: boolean;
};
export default function MiniNavBarHeader({
  id,
  children,
  className = 'mt-5',
  showOnPage = true,
  comingSoon = false,
}: IMiniNavBarHeader) {
  const { invalidateCache } = useContext(StickyMiniNavBarContext);
  useEffect(() => {
    invalidateCache();
    return () => {
      invalidateCache();
    };
  }, []);

  if (!showOnPage) {
    return (
      <div
        id={id}
        mini-nav-bar-header=""
        style={{ visibility: 'hidden', height: 0 }}
      >
        {children}
      </div>
    );
  }
  return (
    <h3 className={classnames('d-flex align-items-center', className)}>
      <span
        id={id}
        mini-nav-bar-header=""
        coming-soon={comingSoon ? '' : undefined}
      >
        {children}
      </span>
      {comingSoon && <ComingSoonTag className="ml-2" size="lg" />}
    </h3>
  );
}
