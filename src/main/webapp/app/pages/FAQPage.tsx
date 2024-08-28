import * as React from 'react';
import Iframe from 'react-iframe';
import { inject } from 'mobx-react';
import { PAGE_DESCRIPTION, PAGE_TITLE } from 'app/config/constants';
import { getPageTitle } from 'app/shared/utils/Utils';
import { Helmet } from 'react-helmet-async';

const FAQPageContent: React.FunctionComponent<{
  userMessageBannerEnabled: boolean;
}> = props => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle(PAGE_TITLE.FAQ)}</title>
        <meta name="description" content={PAGE_DESCRIPTION.FAQ} />
      </Helmet>
      <Iframe
        url="https://faq.oncokb.org"
        className={
          props.userMessageBannerEnabled ? 'faq-iframe-high-top' : 'faq-iframe'
        }
      />
    </>
  );
};
const FAQPage = inject((stores: any) => ({
  userMessageBannerEnabled: stores.appStore.userMessageBannerEnabled,
}))(FAQPageContent);
export default FAQPage;
