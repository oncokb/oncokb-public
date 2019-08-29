import * as React from 'react';

export function loaderWithText(text: string) {
  return (
    <div className="text-center">
      <i className="fa fa-spinner fa-pulse fa-2x" />
      <div>{text}</div>
    </div>
  );
}
