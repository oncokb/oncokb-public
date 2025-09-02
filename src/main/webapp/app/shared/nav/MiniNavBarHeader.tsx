import React, { useContext, useEffect } from 'react';
import { StickyMiniNavBarContext } from './StickyMiniNavBar';

type IMiniNavBarHeader = {
  id: string;
  children: React.ReactNode;
  className?: string;
  showOnPage?: boolean;
};
export default function MiniNavBarHeader({
  id,
  children,
  className = 'mt-5',
  showOnPage = true,
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
    <h3 id={id} className={className} mini-nav-bar-header="">
      {children}
    </h3>
  );
}
