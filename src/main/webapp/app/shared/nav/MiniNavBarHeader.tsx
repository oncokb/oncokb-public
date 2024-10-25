import React from 'react';

type IMiniNavBarHeader = {
  id: string;
  children: React.ReactNode;
};
export default function MiniNavBarHeader({ id, children }: IMiniNavBarHeader) {
  return (
    <h4 id={id} className={'mt-4'} mini-nav-bar-header="">
      {children}
    </h4>
  );
}
