import * as React from 'react';
import Iframe from 'react-iframe';
import { inject } from 'mobx-react';
import {
  PAGE_DESCRIPTION,
  PAGE_TITLE,
  PREMIUM_API_DOCUMENT_LINK,
} from 'app/config/constants';
import { getPageTitle } from 'app/shared/utils/Utils';
import { Helmet } from 'react-helmet-async';

const PremiumApiDocumentationPageContent: React.FunctionComponent<{
  userMessageBannerEnabled: boolean;
}> = props => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle(PAGE_TITLE.PREMIUM_API_DOCUMENTATION)}</title>
        <meta name="description" content={PAGE_DESCRIPTION.API_ACCESS} />
      </Helmet>
      <Iframe
        url={PREMIUM_API_DOCUMENT_LINK}
        className={
          props.userMessageBannerEnabled
            ? 'gitbook-iframe-high-top'
            : 'gitbook-iframe'
        }
      />
    </>
  );
};

export const PremiumApiDocumentationPage = inject((stores: any) => ({
  userMessageBannerEnabled: stores.appStore.userMessageBannerEnabled,
}))(PremiumApiDocumentationPageContent);
