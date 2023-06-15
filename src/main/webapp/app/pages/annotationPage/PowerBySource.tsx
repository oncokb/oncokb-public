import React from 'react';

import OptimizedImage from 'app/shared/image/OptimizedImage';
import { Linkout } from 'app/shared/links/Linkout';

export const PowerBySource: React.FunctionComponent<{
  name: string;
  url: string;
  logo: any;
}> = props => {
  return (
    <div className={'d-flex my-2 align-items-center'}>
      <OptimizedImage
        src={props.logo}
        className="mx-2"
        style={{ height: '30px' }}
      />
      <div className={'d-flex flex-column align-items-center'}>
        <div>
          <b>{props.name}</b>
        </div>
        <Linkout link={props.url} />
      </div>
    </div>
  );
};
