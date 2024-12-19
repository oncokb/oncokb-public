import React from 'react';
import { Linkout } from 'app/shared/links/Linkout';
import { ONCOKB_NEWS_GROUP_SUBSCRIPTION_LINK } from 'app/config/constants';

export const LinkedInLink: React.FunctionComponent<{
  short?: boolean;
}> = props => {
  return (
    <Linkout link={'https://www.linkedin.com/company/oncokb/'}>
      LinkedIn{props.short ? '' : ' (OncoKB)'}
    </Linkout>
  );
};

export const UserGoogleGroupLink: React.FunctionComponent = props => {
  return (
    <Linkout link={ONCOKB_NEWS_GROUP_SUBSCRIPTION_LINK}>
      {props.children ? props.children : 'Email List'}
    </Linkout>
  );
};
