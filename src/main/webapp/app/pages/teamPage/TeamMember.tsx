import React from 'react';
import { COILinkout } from 'app/pages/teamPage/COILinkout';

export enum TITLE {
  MD = 'MD',
  PHD = 'PhD',
  MSC = 'MSc',
  MPA = 'MPA',
  FACP = 'FACP',
  FRCPC = 'FRCPC',
  BSC = 'BSc',
  BA = 'BA',
  MPH = 'MPH',
}

export enum INSTITUTION {
  MDANDERSON = 'MD Anderson Cancer Center',
  DFCI = 'Dana-Farber Cancer Institute',
  PRINCE = 'Princess Margaret Cancer Centre',
  JH = 'Johns Hopkins University',
}

export type ITeamMember = {
  lastName: string;
  middleName?: string;
  firstName: string;
  institution?: string;
  faculty?: boolean;
  showCOI?: boolean;
  title?: TITLE[];
};
export const TeamMember: React.FunctionComponent<ITeamMember> = props => {
  let name = `${props.firstName} ${
    props.middleName ? `${props.middleName[0].toUpperCase()}. ` : ''
  }${props.lastName}`;
  if (props.title) {
    name = `${name}, ${props.title.join(', ')}`;
  }
  return (
    <div>
      <div>
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
      </div>
      {props.institution ? (
        <div className={'mb-2'} style={{ fontSize: '0.9rem' }}>
          <i>{props.institution}</i>
        </div>
      ) : null}
    </div>
  );
};
