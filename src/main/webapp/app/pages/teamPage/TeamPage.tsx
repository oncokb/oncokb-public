import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import { DOCUMENT_TITLES } from 'app/config/constants';
import {
  INSTITUTION,
  ITeamMember,
  TeamMember,
  TITLE,
} from 'app/pages/teamPage/TeamMember';

export const TeamPage = () => {
  const teamMembers: ITeamMember[] = [
    {
      firstName: 'Debyani',
      lastName: 'Chakravarty',
      title: [TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Jianjiong',
      lastName: 'Gao',
      title: [TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Sarah',
      lastName: 'Suehnholz',
      title: [TITLE.PHD],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Hongxin',
      lastName: 'Zhang',
      title: [TITLE.MSC],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Ritika',
      lastName: 'Kundra',
      title: [TITLE.MSC],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Moriah',
      lastName: 'Nissan',
      title: [TITLE.PHD],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Yifu',
      lastName: 'Yao',
      title: [TITLE.MSC],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Ederlinda',
      lastName: 'Paraiso',
      title: [TITLE.MPA],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Julia',
      lastName: 'Rudolph',
      title: [TITLE.MPA],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'David',
      middleName: 'B',
      lastName: 'Solit',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Paul',
      lastName: 'Sabbatini',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Nikolaus',
      lastName: 'Schultz',
      title: [TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
  ];
  const curators: ITeamMember[] = [
    {
      firstName: 'Kinisha',
      lastName: 'Gala',
      title: [TITLE.PHD],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Lindsay',
      middleName: 'M',
      lastName: 'LaFave',
      title: [TITLE.PHD],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Linde',
      middleName: 'A',
      lastName: 'Miles',
      title: [TITLE.PHD],
      faculty: false,
      showCOI: true,
    },
  ];
  const cgac: ITeamMember[] = [
    {
      firstName: 'Lisa',
      middleName: 'M',
      lastName: 'DeAngelis',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Philip',
      lastName: 'Kantoff',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'David',
      middleName: 'S',
      lastName: 'Klimstra',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Marc',
      lastName: 'Ladanyi',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Ross',
      middleName: 'L',
      lastName: 'Levine',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Michael',
      middleName: 'F',
      lastName: 'Berger',
      title: [TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Maria',
      middleName: 'E',
      lastName: 'Arcila',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Ahmet',
      lastName: 'Dogan',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Sarat',
      lastName: 'Chandarlapaty',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Ping',
      lastName: 'Chi',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Rona',
      lastName: 'Yaeger',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Wassim',
      lastName: 'Abida',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Alexander',
      lastName: 'Drilon',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Diana',
      lastName: 'Mandelker',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Kamal',
      lastName: 'Menghrajani',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Alison',
      lastName: 'Schram',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Santosha',
      lastName: 'Vardhana',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Carol',
      lastName: 'Aghajanian',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Daniel',
      middleName: 'C',
      lastName: 'Danila',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Eli',
      middleName: 'L',
      lastName: 'Diamond',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'James',
      middleName: 'A',
      lastName: 'Fagin',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Alan',
      middleName: 'L',
      lastName: 'Ho',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Gopa',
      lastName: 'Iyer',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Komal',
      lastName: 'Jhaveri',
      title: [TITLE.MD, TITLE.FACP],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Andrew',
      lastName: 'Kung',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Ingo',
      middleName: 'K',
      lastName: 'Mellinghoff',
      title: [TITLE.MD, TITLE.FACP],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Kenneth',
      lastName: 'Offit',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Paul',
      middleName: 'K',
      lastName: 'Paik',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'David',
      middleName: 'G',
      lastName: 'Pfister',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Jonathan',
      middleName: 'E',
      lastName: 'Rosenberg',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Gregory',
      middleName: 'J',
      lastName: 'Riely',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Mark',
      middleName: 'E',
      lastName: 'Robson',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Neal',
      lastName: 'Rosen',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Leonard',
      lastName: 'Saltz',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Sohrab',
      lastName: 'Shah',
      title: [TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Alexander',
      middleName: 'N',
      lastName: 'Shoushtari',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Neerav',
      middleName: 'N',
      lastName: 'Shukla',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Zsofia',
      middleName: 'K',
      lastName: 'Stadler',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'William',
      middleName: 'D',
      lastName: 'Tap',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Martin',
      middleName: 'H',
      lastName: 'Voss',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Jedd',
      middleName: 'D',
      lastName: 'Wolchok',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Steven',
      lastName: 'Maron',
      title: [TITLE.MD, TITLE.MSC],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'James',
      middleName: 'J',
      lastName: 'Harding',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Anna',
      middleName: 'M',
      lastName: 'Varghese',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
  ];
  const eab: ITeamMember[] = [
    {
      firstName: 'Alexander',
      middleName: 'J',
      lastName: 'Lazar',
      title: [TITLE.MD, TITLE.PHD],
      institution: INSTITUTION.MDANDERSON,
      showCOI: true,
    },
    {
      firstName: 'Lillian',
      middleName: 'L',
      lastName: 'Siu',
      title: [TITLE.MD, TITLE.FRCPC],
      institution: INSTITUTION.PRINCE,
      showCOI: true,
    },
    {
      firstName: 'Eliezer',
      lastName: 'Van Allen',
      title: [TITLE.MD],
      institution: INSTITUTION.DFCI,
      showCOI: true,
    },
    {
      firstName: 'Victor',
      middleName: 'E',
      lastName: 'Velculescu',
      title: [TITLE.MD, TITLE.PHD],
      institution: INSTITUTION.JH,
      showCOI: true,
    },
  ];
  const pastContributors: ITeamMember[] = [
    { firstName: 'Tripti Shrestha', lastName: 'Bhattarai', title: [TITLE.PHD] },
    { firstName: 'Fiona', lastName: 'Brown', title: [TITLE.PHD] },
    {
      firstName: 'Margaret',
      lastName: 'Callahan',
      title: [TITLE.MD, TITLE.PHD],
    },
    { firstName: 'Timothy A.', lastName: 'Chan', title: [TITLE.MD, TITLE.PHD] },
    { firstName: 'Luis Alberto', lastName: 'Diaz Jr.', title: [TITLE.MD] },
    { firstName: 'Renzo', lastName: 'DiNatale', title: [TITLE.MD] },
    { firstName: 'Mrinal M.', lastName: 'Gounder', title: [TITLE.MD] },
    { firstName: 'Aphrothiti', lastName: 'Hanrahan', title: [TITLE.PHD] },
    { firstName: 'James J.', lastName: 'Harding', title: [TITLE.MD] },
    { firstName: 'Matthew D.', lastName: 'Hellmann', title: [TITLE.MD] },
    { firstName: 'Anton', lastName: 'Henssen', title: [TITLE.MD] },
    { firstName: 'David', lastName: ' Hyman', title: [TITLE.MD] },
    { firstName: 'Edgar A.', lastName: 'Jaimes', title: [TITLE.MD] },
    { firstName: 'Phillip', lastName: 'Jonsson', title: [TITLE.PHD] },
    { firstName: 'David', lastName: 'Knorr', title: [TITLE.MD, TITLE.PHD] },
    { firstName: 'Iñigo', lastName: 'Landa-Lopez', title: [TITLE.PHD] },
    { firstName: 'C. Ola', lastName: 'Landgren', title: [TITLE.MD, TITLE.PHD] },
    { firstName: 'Dana E.', lastName: 'Rathkopf', title: [TITLE.MD] },
    { firstName: 'Howard I.', lastName: 'Scher', title: [TITLE.MD] },
    { firstName: 'Neel', lastName: 'Shah', title: [TITLE.PHD] },
    { firstName: 'Tara', lastName: 'Soumerai', title: [TITLE.MD] },
    { firstName: 'Jing', lastName: 'Su', title: [TITLE.MSC] },
    { firstName: 'William D.', lastName: 'Tap', title: [TITLE.MD] },
    { firstName: 'Barry S.', lastName: 'Taylor', title: [TITLE.PHD] },
    { firstName: 'Eneda', lastName: 'Toska', title: [TITLE.PHD] },
    { firstName: 'Tiffany A.', lastName: 'Traina', title: [TITLE.MD] },
    { firstName: 'Jiaojiao', lastName: 'Wang', title: [TITLE.MSC] },
    { firstName: 'Hannah', lastName: 'Wise', title: [TITLE.PHD] },
    { firstName: 'Anas', lastName: 'Younes', title: [TITLE.MD] },
    { firstName: 'Emiliano', lastName: 'Cocco', title: [TITLE.PHD] },
    { firstName: 'Maurizio', lastName: 'Scaltriti', title: [TITLE.MD] },
  ];
  return (
    <DocumentTitle title={DOCUMENT_TITLES.TEAM}>
      <div className="team">
        <Row>
          <Col>
            <h2>OncoKB Team</h2>
            <p>
              OncoKB is developed and maintained by the Knowledge Systems group
              in the{' '}
              <a href="https://www.mskcc.org/research-areas/programs-centers/molecular-oncology">
                Marie Josée and Henry R. Kravis Center for Molecular Oncology
              </a>{' '}
              at Memorial Sloan Kettering Cancer Center.
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={6} md>
            <h5>Design &amp; Development</h5>
            <ul>
              {teamMembers.map(member => (
                <li>
                  <TeamMember {...member} />
                </li>
              ))}
            </ul>
            <h5>Current Curators</h5>
            <ul>
              {_.sortBy(curators, member => member.lastName).map(member => (
                <li>
                  <TeamMember {...member} />
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={6} md>
            <h5>Clinical Genomics Annotation Committee</h5>
            <ul>
              {_.sortBy(cgac, member => member.lastName).map(member => (
                <li>
                  <TeamMember {...member} />
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={6} md>
            <h5>External Advisory Board</h5>
            <ul>
              {_.sortBy(eab, member => member.lastName).map(member => (
                <li>
                  <TeamMember {...member} />
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={6} md>
            <h5>Past Contributors *</h5>
            <ul>
              {pastContributors.map(member => (
                <li>
                  <TeamMember {...member} faculty={false} showCOI={false} />
                </li>
              ))}
            </ul>
            <div>* We do not track their conflicts of interests.</div>
          </Col>
        </Row>
      </div>
    </DocumentTitle>
  );
};
