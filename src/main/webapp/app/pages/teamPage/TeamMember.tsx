import React from 'react';
import { COILinkout } from 'app/pages/teamPage/COILinkout';

export enum TITLE {
  MD = 'MD',
  PHD = 'PhD',
  MSC = 'MSc',
  MPA = 'MPA',
  FACP = 'FACP',
}

export type ITeamMember = {
  lastName: string;
  firstName: string;
  faculty: boolean;
  showCOI?: boolean;
  title?: TITLE[];
};
export const TeamMember: React.FunctionComponent<ITeamMember> = props => {
  let name = `${props.firstName} ${props.lastName}`;
  if (props.title) {
    name = `${name}, ${props.title.join(', ')}`;
  }
  return (
    <span>
      {name}{' '}
      {props.showCOI ? (
        <>
          {' '}
          <COILinkout
            lastName={props.lastName}
            firstName={props.firstName}
            faculty={props.faculty}
          />
        </>
      ) : null}
    </span>
  );
};
