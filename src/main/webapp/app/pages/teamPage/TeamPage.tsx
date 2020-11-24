import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import DocumentTitle from 'react-document-title';
import { DOCUMENT_TITLES } from 'app/config/constants';
import { ITeamMember, TeamMember, TITLE } from 'app/pages/teamPage/TeamMember';

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
      lastName: 'Phillips',
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
      firstName: 'Lindsay M.',
      lastName: 'LaFave',
      title: [TITLE.PHD],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Linde',
      lastName: 'Miles',
      title: [TITLE.PHD],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Emiliano',
      lastName: 'Cocco',
      title: [TITLE.PHD],
      faculty: false,
      showCOI: true,
    },
  ];
  const cgac: ITeamMember[] = [
    {
      firstName: 'Lisa',
      lastName: 'DeAngelis',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Phil',
      lastName: 'Kantoff',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'David',
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
      lastName: 'Levine',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Michael',
      lastName: 'Berger',
      title: [TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Maria',
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
      firstName: 'Alex',
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
      lastName: 'Danila',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Eli',
      lastName: 'Diamond',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'James',
      lastName: 'Fagin',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Alan',
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
      lastName: 'Paik',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'David',
      lastName: 'Pfister',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Jonathan',
      lastName: 'Rosenberg',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Gregory',
      lastName: 'Riely',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Mark',
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
      firstName: 'Maurizio',
      lastName: 'Scaltriti',
      title: [TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Alexander',
      lastName: 'Shoushtari',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Neerav',
      lastName: 'Shukla',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Zsofia',
      lastName: 'Stadler',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'William',
      lastName: 'Tap',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Martin',
      lastName: 'Voss',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Jedd',
      lastName: 'Wolchok',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
  ];
  const pastContributors: {
    firstName: string;
    lastName: string;
    title: TITLE[];
  }[] = [
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
            <h6>Design &amp; Development</h6>
            <ul>
              {teamMembers.map(member => (
                <li>
                  <TeamMember {...member} />
                </li>
              ))}
            </ul>
            <h6>Current Curators</h6>
            <ul>
              {curators.map(member => (
                <li>
                  <TeamMember {...member} />
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={6} md>
            <h6>Clinical Genomics Annotation Committee</h6>
            <ul>
              {cgac.map(member => (
                <li>
                  <TeamMember {...member} />
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={6} md>
            <h6>Past Contributors *</h6>
            <ul>
              {pastContributors.map(member => (
                <li>
                  <TeamMember {...member} faculty={false} showCOI={false} />
                </li>
              ))}
            </ul>
          </Col>
        </Row>
        <Row>
          <div>* We do not track their conflicts of interests.</div>
        </Row>
      </div>
    </DocumentTitle>
  );
};
