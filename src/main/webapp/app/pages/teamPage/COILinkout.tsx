import React from 'react';
import { Linkout } from 'app/shared/links/Linkout';
import {
  FACULTY_COI_WEBSITE_LINK,
  NONE_FACULTY_COI_WEBSITE_LINK
} from 'app/config/constants';

export const COILinkout: React.FunctionComponent<{
  firstName: string;
  lastName: string;
  faculty: boolean;
}> = props => {
  const link = props.faculty
    ? `${FACULTY_COI_WEBSITE_LINK}?title=${props.lastName}, ${props.firstName}`
    : NONE_FACULTY_COI_WEBSITE_LINK;
  return (
    <Linkout link={link}>
      <span style={{ fontSize: '0.7rem' }}>
        <i>COIs</i>
        <i className={'fa fa-external-link ml-1'}></i>
      </span>
    </Linkout>
  );
};
