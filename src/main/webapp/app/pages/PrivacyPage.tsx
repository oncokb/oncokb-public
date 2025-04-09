import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Row, Col } from 'react-bootstrap';
import { getPageTitle } from 'app/shared/utils/Utils';
import { PAGE_TITLE, PAGE_DESCRIPTION, ONCOKB_TM } from 'app/config/constants';
import styles from './PrivacyPage.module.scss';
import classNames from 'classnames';
import PrivacyNotice from './privacyNotice/code-generated/PrivacyNotice';

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>{getPageTitle(PAGE_TITLE.PRIVACY)}</title>
        <meta name="description" content={PAGE_DESCRIPTION.PRIVACY}></meta>
      </Helmet>
      <main className={styles.privacyPage}>{<PrivacyNotice />}</main>
    </>
  );
}
