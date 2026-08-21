import React from 'react';
import classnames from 'classnames';
import { DefaultTooltip, getNCBIlink } from 'cbioportal-frontend-commons';
import { Link } from 'react-router-dom';
import styles from './CancerHotspot.module.scss';
import { Linkout } from 'app/shared/links/Linkout';
import { CANCER_HOTSPOTS_LINK, ONCOKB_TM } from 'app/config/constants';
// The flame icon cbioportal.org uses for hotspots, copied from the asset
// react-mutation-mapper inlines (it is not exported by the package).
import cancerHotspotImg from 'content/images/cancer-hotspots.svg';

// OncoKB only annotates recurrent hotspots. The 3d rows in the source data are
// filtered out before matching, so the tooltip intentionally drops the 3D
// clustered hotspot wording used by cBioPortal.
export const CancerHotspotTooltipContent: React.FunctionComponent<{}> = () => (
  <div style={{ maxWidth: 450 }}>
    <div>
      <b>Recurrent Hotspot</b>
    </div>
    <div className={'mt-1'}>
      This mutated amino acid was identified as a recurrent hotspot
      (statistically significant) in a population-scale cohort of tumor samples
      of various cancer types, using methodology based in part on{' '}
      <Linkout link={getNCBIlink('/pubmed/26619011')}>
        Chang et al., Nat Biotechnol, 2016
      </Linkout>
      ,{' '}
      <Linkout link={getNCBIlink('/pubmed/29247016')}>
        Chang et al., Cancer Discov, 2018
      </Linkout>{' '}
      and <Linkout link={CANCER_HOTSPOTS_LINK}>Bandlamudi et al., 2026</Linkout>
      .
    </div>
    <div className={'mt-1'}>
      <i>
        {ONCOKB_TM} annotates recurrent hotspots only; 3D clustered hotspots are
        not included.
      </i>
    </div>
    <div className={'mt-1'}>
      Explore all mutations at{' '}
      <Linkout link={CANCER_HOTSPOTS_LINK}>cancerhotspots.org</Linkout>.
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

/**
 * The hotspot icon as a link to the hotspot page. An external link style icon
 * slides out on hover so the icon reads as clickable — the tooltip alone
 * explains what a hotspot is, not that there is somewhere to go.
 */
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
