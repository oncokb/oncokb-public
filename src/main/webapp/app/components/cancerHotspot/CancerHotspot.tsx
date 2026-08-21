import React from 'react';
import classnames from 'classnames';
import { DefaultTooltip, getNCBIlink } from 'cbioportal-frontend-commons';
import { Link } from 'react-router-dom';
import styles from './CancerHotspot.module.scss';
import { Linkout } from 'app/shared/links/Linkout';
import { CANCER_HOTSPOTS_LINK, ONCOKB_TM } from 'app/config/constants';
import cancerHotspotImg from 'content/images/cancer-hotspots.svg';

export const CancerHotspotTooltipContent: React.FunctionComponent<{}> = () => (
  <div style={{ maxWidth: 450 }}>
    <div>
      <b>Recurrent Hotspot</b>
    </div>
    <div className={'mt-1'}>
      This mutant allele was identified as a statistically significant recurrent
      hotspot in a population-scale cohort of tumor samples comprised of several
      cancer types using methodology based in part on{' '}
      <Linkout link={getNCBIlink('/pubmed/26619011')}>
        Chang et al. 2016
      </Linkout>
      ,{' '}
      <Linkout link={getNCBIlink('/pubmed/29247016')}>
        Chang et al. 2018
      </Linkout>
      , and{' '}
      <Linkout link={getNCBIlink('/pubmed/41895280')}>
        Bandlamudi et al. 2026
      </Linkout>
      .
    </div>
    <div className={'mt-1'}>
      {ONCOKB_TM} only annotates recurrent mutant allele hotspots (3D clustered
      hotspots are not included).
    </div>
    <div className={'mt-1'}>
      Explore all recurrent hotspots in cancer at{' '}
      <Linkout link={CANCER_HOTSPOTS_LINK}>cancerhotspots.org</Linkout>
    </div>
  </div>
);

export const CancerHotspotIcon: React.FunctionComponent<{
  className?: string;
  size?: number;
}> = ({ size = 36, ...props }) => (
  <DefaultTooltip
    overlay={() => <CancerHotspotTooltipContent />}
    placement={'top'}
  >
    <img
      className={props.className}
      width={size}
      height={size}
      src={cancerHotspotImg}
      alt={'Recurrent Hotspot Symbol'}
    />
  </DefaultTooltip>
);

export const CancerHotspotLink: React.FunctionComponent<{
  link: string;
  ariaLabel: string;
  size?: number;
}> = props => (
  <Link
    to={props.link}
    className={styles.hotspotLink}
    aria-label={props.ariaLabel}
  >
    <CancerHotspotIcon size={props.size} />
    <i className={classnames('fa fa-external-link', styles.icon)} />
  </Link>
);
