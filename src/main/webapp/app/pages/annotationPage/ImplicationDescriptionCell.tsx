import React from 'react';
import { LongText } from 'app/oncokb-frontend-commons/src/components/LongText';
import { Link } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';
import { DescriptionTooltip } from 'app/pages/annotationPage/DescriptionTooltip';

export const ImplicationDescriptionCell: React.FunctionComponent<{
  userAuthenticated: boolean;
  description: string;
}> = props => {
  if (props.userAuthenticated) {
    return (
      <span>
        <LongText text={props.description} />
      </span>
    );
  } else {
    return (
      <DescriptionTooltip
        description={
          <span>
            Get access to our treatment descriptions by{' '}
            <Link to={PAGE_ROUTE.LOGIN}> logging in </Link> or by{' '}
            <Link to={PAGE_ROUTE.REGISTER}>registering</Link> an account.
          </span>
        }
      />
    );
  }
};
