import React from 'react';

type IMiniNavBarHeader = {
  id: string;
  children: React.ReactNode;
  className?: string;
};
export default function MiniNavBarHeader({
  id,
  children,
  className = 'mt-5',
}: IMiniNavBarHeader) {
  return (
    <h3 id={id} className={className} mini-nav-bar-header="">
      {children}
    </h3>
  );
}
