import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function NewsContent042025() {
  return (
    <>
      <ul>
        <li>
          Release of{' '}
          <a href="https://sop.oncokb.org/?version=v4.2">OncoKB™ SOP v5.0</a>
        </li>
        <li>
          Update to our{' '}
          <Link to="/companion-diagnostic-devices">
            FDA Cleared or Approved Companion Diagnostic Devices
          </Link>{' '}
          (CDx) page
        </li>
        <li>
          Update to our{' '}
          <Link to="/oncology-therapies">FDA-Approved Oncology Therapies</Link>{' '}
          page
        </li>
      </ul>
      <p>
        <strong>Updated Therapeutic Implications</strong>
      </p>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={[
              'AGK',
              'CAMTA1',
              'CREB3L2',
              'CREM',
              'CRTC1',
              'EML4',
              'JAZF1',
              'KIAA1549',
              'MAML2',
              'NAB2',
              'NCOA4',
              'SSX1',
              'SSX2',
              'TPM3',
            ]}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
