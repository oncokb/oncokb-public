import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { PAGE_TITLE, ONCOKB_TM, PAGE_DESCRIPTION } from 'app/config/constants';
import {
  INSTITUTION,
  IPastMember,
  MEMBER_TYPE,
  ITeamMember,
  TeamMember,
  TITLE,
} from 'app/pages/teamPage/TeamMember';
import { getPageTitle } from 'app/shared/utils/Utils';
import { sortBy } from 'app/shared/utils/LodashUtils';
import { Helmet } from 'react-helmet-async';
import styles from './TeamPage.module.scss';

const teamMembers: ITeamMember[] = [
  {
    firstName: 'Debyani',
    lastName: 'Chakravarty',
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
    firstName: 'Calvin',
    lastName: 'Lu',
    title: [TITLE.BSC],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Nicole',
    lastName: 'Fernandez',
    title: [TITLE.MSC],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Kelly',
    lastName: 'Cavender',
    title: [TITLE.BSC],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Kinisha',
    lastName: 'Gala',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Benjamin',
    lastName: 'Preiser',
    title: [TITLE.BSC],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Reshma',
    lastName: 'Ramaiah',
    title: [TITLE.MSC],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'John',
    lastName: 'Konecny',
    title: [TITLE.BSC],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Bo',
    lastName: 'Kim',
    title: [TITLE.BSC],
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
    firstName: 'Jianjiong',
    lastName: 'Gao',
    title: [TITLE.PHD],
    faculty: false,
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
const cgac: ITeamMember[] = sortBy(
  [
    {
      firstName: 'Lisa',
      middleName: 'M',
      lastName: 'DeAngelis',
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
    {
      firstName: 'Tejus',
      middleName: 'A',
      lastName: 'Bale',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Adrienne',
      middleName: 'A',
      lastName: 'Boire',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Thomas',
      middleName: 'J',
      lastName: 'Kaley',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Eileen',
      middleName: 'M',
      lastName: "O'Reilly",
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Eric',
      middleName: 'J',
      lastName: 'Sherman',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Edgar',
      middleName: 'A',
      lastName: 'Jaimes',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Aaron',
      middleName: 'David',
      lastName: 'Goldberg',
      title: [TITLE.MD, TITLE.PHD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Yonina',
      lastName: 'Murciano-Goroff',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Chimene',
      lastName: 'Kesserwan',
      title: [TITLE.MD],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Andrew',
      lastName: 'Lin',
      title: [TITLE.MD],
      faculty: false,
      showCOI: true,
    },
    {
      firstName: 'Ying',
      lastName: 'Liu',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Maria',
      lastName: 'Carlo',
      title: [TITLE.MD],
      faculty: true,
      showCOI: true,
    },
    {
      firstName: 'Lauren',
      lastName: 'Banaszak',
      title: [TITLE.MD],
      faculty: false,
      showCOI: true,
    },
  ],
  member => member.lastName
);
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

const dmg: ITeamMember[] = [
  {
    firstName: 'Nikita',
    lastName: 'Mehta',
    title: [TITLE.MSC],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Eva',
    lastName: 'Park',
    title: [TITLE.MPH],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Ciyu',
    lastName: 'Yang',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Yirong',
    lastName: 'Li',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Bree',
    lastName: 'Martin',
    title: [TITLE.MSC],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Ozge',
    lastName: 'Ceyhan-Birsoy',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Maksym',
    lastName: 'Misyura',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Panieh',
    lastName: 'Terraf',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Chuan',
    lastName: 'Gao',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
  },
  {
    firstName: 'Neal',
    lastName: 'Cody',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
  },
];

const cgs: ITeamMember[] = [
  {
    firstName: 'Margaret',
    lastName: 'Sheehan',
    title: [TITLE.MSC],
    showCOI: true,
    faculty: false,
  },
  {
    firstName: 'Yelena',
    lastName: 'Kemel',
    title: [TITLE.MSC],
    showCOI: true,
    faculty: true,
  },
];

const pastContributors: IPastMember[] = [
  {
    firstName: 'Tripti',
    lastName: 'Shrestha Bhattarai',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Fiona',
    lastName: 'Brown',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Margaret',
    lastName: 'Callahan',
    title: [TITLE.MD, TITLE.PHD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Timothy',
    middleName: 'A',
    lastName: 'Chan',
    title: [TITLE.MD, TITLE.PHD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Luis Alberto',
    lastName: 'Diaz Jr.',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Renzo',
    lastName: 'DiNatale',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Mrinal M.',
    lastName: 'Gounder',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Aphrothiti',
    lastName: 'Hanrahan',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Matthew',
    middleName: 'D',
    lastName: 'Hellmann',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Anton',
    lastName: 'Henssen',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'David',
    lastName: 'Hyman',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Edgar',
    middleName: 'A',
    lastName: 'Jaimes',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Phillip',
    lastName: 'Jonsson',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'David',
    lastName: 'Knorr',
    title: [TITLE.MD, TITLE.PHD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Iñigo',
    lastName: 'Landa-Lopez',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'C. Ola',
    lastName: 'Landgren',
    title: [TITLE.MD, TITLE.PHD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Dana',
    middleName: 'E',
    lastName: 'Rathkopf',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Howard',
    middleName: 'I',
    lastName: 'Scher',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Neel',
    lastName: 'Shah',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Tara',
    lastName: 'Soumerai',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Jing',
    lastName: 'Su',
    title: [TITLE.MSC],
    type: MEMBER_TYPE.CORE,
  },
  {
    firstName: 'William',
    middleName: 'D',
    lastName: 'Tap',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Barry',
    middleName: 'S',
    lastName: 'Taylor',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Eneda',
    lastName: 'Toska',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Tiffany',
    middleName: 'A',
    lastName: 'Traina',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Jiaojiao',
    lastName: 'Wang',
    title: [TITLE.MSC],
    type: MEMBER_TYPE.CORE,
  },
  {
    firstName: 'Hannah',
    lastName: 'Wise',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Anas',
    lastName: 'Younes',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Emiliano',
    lastName: 'Cocco',
    title: [TITLE.PHD],
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Maurizio',
    lastName: 'Scaltriti',
    title: [TITLE.MD],
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Yifu',
    lastName: 'Yao',
    title: [TITLE.MSC],
    type: MEMBER_TYPE.CORE,
  },
  {
    firstName: 'Lindsay',
    middleName: 'M',
    lastName: 'LaFave',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Linde',
    middleName: 'A',
    lastName: 'Miles',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'David',
    middleName: 'S',
    lastName: 'Klimstra',
    title: [TITLE.MD],
    faculty: true,
    showCOI: true,
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Philip',
    lastName: 'Kantoff',
    title: [TITLE.MD],
    faculty: true,
    showCOI: true,
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Ingo',
    middleName: 'K',
    lastName: 'Mellinghoff',
    title: [TITLE.MD, TITLE.FACP],
    faculty: true,
    showCOI: true,
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Jedd',
    middleName: 'D',
    lastName: 'Wolchok',
    title: [TITLE.MD, TITLE.PHD],
    faculty: true,
    showCOI: true,
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Stephanie',
    lastName: 'Carrero',
    title: [TITLE.BA],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CORE,
  },
  {
    firstName: 'Katja',
    lastName: 'Srpan',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Alvaro',
    lastName: 'Quintanal-Villalonga',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Katelyn',
    lastName: 'Mullen',
    title: [TITLE.BSC],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Thinh',
    lastName: 'Tran',
    title: [TITLE.MSC],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Yan',
    lastName: 'Li',
    title: [TITLE.MD, TITLE.PHD],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Francesco',
    lastName: 'Cambuli',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CURATOR,
  },
  {
    firstName: 'Kamal',
    lastName: 'Menghrajani',
    title: [TITLE.MD],
    faculty: true,
    showCOI: true,
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Neal',
    lastName: 'Rosen',
    title: [TITLE.MD, TITLE.PHD],
    faculty: true,
    showCOI: true,
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Amanda',
    lastName: 'Dhaneshwar',
    title: [TITLE.PHD],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CORE,
  },
  {
    firstName: 'Hongxin',
    lastName: 'Zhang',
    title: [TITLE.MSC],
    faculty: false,
    showCOI: true,
    type: MEMBER_TYPE.CORE,
  },
  {
    firstName: 'Benjamin',
    lastName: 'Xu',
    type: MEMBER_TYPE.CORE,
  },
  {
    firstName: 'Bob',
    middleName: 'T',
    lastName: 'Li',
    title: [TITLE.MD, TITLE.PHD, TITLE.MPH],
    faculty: true,
    showCOI: true,
    type: MEMBER_TYPE.CGAC,
  },
  {
    firstName: 'Melissa',
    lastName: 'Nguyen',
    title: [TITLE.BSC],
    faculty: false,
    showCOI: false,
    type: MEMBER_TYPE.CORE,
  },
];

type TeamSections = {
  teamName: string;
  members: ITeamMember[];
  arePastMembers: boolean;
};

const teamSections: TeamSections[] = [
  {
    teamName: 'Design & Development',
    members: teamMembers,
    arePastMembers: false,
  },
  {
    teamName: 'External Advisory Board',
    members: sortBy(eab, member => member.lastName),
    arePastMembers: false,
  },
  {
    teamName: 'Clinical Genomics Annotation Committee',
    members: sortBy(cgac, member => member.lastName),
    arePastMembers: false,
  },
  {
    teamName: 'Clinical Genetics Service',
    members: sortBy(cgs, member => member.lastName),
    arePastMembers: false,
  },
  {
    teamName: 'Diagnostic Molecular Genetics',
    members: sortBy(dmg, member => member.lastName),
    arePastMembers: false,
  },
  {
    teamName: 'Design & Development Members',
    members: sortBy(
      pastContributors.filter(x => x.type === MEMBER_TYPE.CORE),
      member => member.lastName
    ),
    arePastMembers: true,
  },
  {
    teamName: 'CGAC Members',
    members: sortBy(
      pastContributors.filter(x => x.type === MEMBER_TYPE.CGAC),
      member => member.lastName
    ),
    arePastMembers: true,
  },
  {
    teamName: 'Curators',
    members: sortBy(
      pastContributors.filter(x => x.type === MEMBER_TYPE.CURATOR),
      member => member.lastName
    ),
    arePastMembers: true,
  },
];

export const TeamPage = () => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle(PAGE_TITLE.TEAM)}</title>
        <meta name="description" content={PAGE_DESCRIPTION.TEAM} />
      </Helmet>

      <div className="team">
        <Row>
          <Col>
            <h2>{ONCOKB_TM} Team</h2>
            <p>
              {ONCOKB_TM} is developed and maintained by the Knowledge Systems
              group in the{' '}
              <a href="https://www.mskcc.org/research-areas/programs-centers/molecular-oncology">
                Marie Josée and Henry R. Kravis Center for Molecular Oncology
              </a>{' '}
              at Memorial Sloan Kettering Cancer Center.
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <section className={styles.grid}>
              {teamSections.map(section => {
                return (
                  <>
                    {section.arePastMembers ? (
                      <h3 className="h5">
                        <span className="badge badge-secondary">Past</span>{' '}
                        {section.teamName}
                      </h3>
                    ) : (
                      <h3 className="h5">{section.teamName}</h3>
                    )}
                    <ul>
                      {section.members.map(member => (
                        <li key={`${member.lastName}-${member.firstName}`}>
                          {section.arePastMembers ? (
                            <TeamMember
                              {...member}
                              showCOI={false}
                              faculty={false}
                            />
                          ) : (
                            <TeamMember {...member} />
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })}
            </section>
          </Col>
        </Row>
      </div>
    </>
  );
};
