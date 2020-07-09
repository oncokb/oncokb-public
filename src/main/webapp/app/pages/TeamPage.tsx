import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import DocumentTitle from 'react-document-title';
import { DOCUMENT_TITLES } from 'app/config/constants';

export const TeamPage = () => {
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
              at Memorial Sloan Kettering Cancer Center. Disclosure of conflicts
              of interest of all OncoKB contributors is available{' '}
              <a
                href="https://docs.google.com/spreadsheets/d/1FaOIvQmLXA7Z9rM_WkgP9QPbfkDHoTLKEUGlr0G2UT0/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
              >
                here.
              </a>
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={6} md>
            <h6>Design &amp; Development</h6>
            <ul>
              <li>Debyani Chakravarty, PhD</li>
              <li>Jianjiong Gao, PhD</li>
              <li>Sarah Phillips, PhD</li>
              <li>Hongxin Zhang, MSc</li>
              <li>Ritika Kundra, MSc</li>
              <li>Moriah Nissan, PhD</li>
              <li>Yifu Yao, MSc</li>
              <li>Ederlinda Paraiso, MPA</li>
              <li>Julia Rudolph, MPA</li>
              <li>David Solit, MD</li>
              <li>Paul Sabbatini, MD</li>
              <li>Nikolaus Schultz, PhD</li>
            </ul>
            <h6>Current Curators</h6>
            <ul>
              <li>Kinisha Gala, PhD</li>
              <li>Lindsay M. LaFave, PhD</li>
              <li>Linde Miles, PhD</li>
              <li>Emiliano Cocco, PhD</li>
            </ul>
          </Col>
          <Col xs={6} md>
            <h6>Clinical Genomics Annotation Committee</h6>
            <ul>
              <li>Lisa DeAngelis, MD</li>
              <li>Phil Kantoff, MD</li>
              <li>David Klimstra, MD</li>
              <li>Marc Ladanyi, MD</li>
              <li>Ross Levine, MD</li>
              <li>Mike Berger, PhD</li>
              <li>Maria Arcila, MD</li>
              <li>Ahmet Dogan, MD, PhD</li>
              <li>Sarat Chandarlapaty, MD, PhD</li>
              <li>Ping Chi, MD, PhD</li>
              <li>Rona Yaeger, MD</li>
              <li>Wassim Abida, MD</li>
              <li>Alex Drilon, MD</li>
              <li>Diana Mandelkar, MD</li>
              <li>Kamal Menghrajani, MD</li>
              <li>Alison Schram, MD</li>
              <li>Santosh Verdhana, MD</li>
              <li>Carol Aghajanian, MD</li>
              <li>Daniel Danilla, MD</li>
              <li>Eli Diamond, MD</li>
              <li>Jim Fagin, MD</li>
              <li>Alan Ho, MD, PhD</li>
              <li>Gopa Iyer, MD</li>
              <li>Komal Jhaveri, MD</li>
              <li>Andrew Kung, MD, PhD</li>
              <li>Ingo Mellinghoff, MD</li>
              <li>Ken Offit, MD</li>
              <li>Paul Paik, MD</li>
              <li>David Pfister, MD</li>
              <li>Jonathan Rosenberg, MD</li>
              <li>Greg Riely, MD, PhD</li>
              <li>Mark Robson, MD</li>
              <li>Neal Rosen, MD, PhD</li>
              <li>Len Saltz, MD</li>
              <li>Sohrab Shah, PhD</li>
              <li>Maurizio Scaltriti, PhD</li>
              <li>Alex Shoushtari, MD</li>
              <li>Neal Shukla, MD</li>
              <li>Zsofia Stadler, MD</li>
              <li>Bill Tap, MD</li>
              <li>Martin Voss, MD</li>
              <li>Jedd Wolchok, MD</li>
            </ul>
          </Col>
          <Col xs={6} md>
            <h6>Past Contributors</h6>
            <ul>
              <li>Tripti Shrestha Bhattarai, PhD</li>
              <li>Fiona Brown, PhD</li>
              <li>Margaret Callahan, MD, PhD</li>
              <li>Timothy A. Chan, MD, PhD</li>
              <li>Luis Alberto Diaz, Jr., MD</li>
              <li>Renzo DiNatale, MD</li>
              <li>Mrinal M. Gounder, MD</li>
              <li>Aphrothiti Hanrahan, PhD</li>
              <li>James J. Harding, MD</li>
              <li>Matthew D. Hellmann, MD</li>
              <li>Anton Henssen, MD</li>
              <li>David Hyman, MD</li>
              <li>Edgar A. Jaimes, MD</li>
              <li>Phillip Jonsson, PhD</li>
              <li>David Knorr, MD, PhD</li>
              <li>Iñigo Landa-Lopez, PhD</li>
              <li>C. Ola Landgren, MD, PhD</li>
              <li>Dana E. Rathkopf, MD</li>
              <li>Howard I. Scher, MD</li>
              <li>Neel Shah, PhD</li>
              <li>Tara Soumerai, MD</li>
              <li>Jing Su, MSc</li>
              <li>William D. Tap, MD</li>
              <li>Barry S. Taylor, PhD</li>
              <li>Eneda Toska, PhD</li>
              <li>Tiffany A. Traina, MD</li>
              <li>Jiaojiao Wang, MSc</li>
              <li>Hannah Wise, PhD</li>
              <li>Anas Younes, MD</li>
            </ul>
          </Col>
        </Row>
      </div>
    </DocumentTitle>
  );
};
