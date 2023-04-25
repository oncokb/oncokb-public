import * as React from 'react';
import Iframe from 'react-iframe';
import { inject } from 'mobx-react';
import DocumentTitle from 'react-document-title';
import { PAGE_TITLE } from 'app/config/constants';
import { getPageTitle } from 'app/shared/utils/Utils';

const FAQPageContent: React.FunctionComponent<{
  userMessageBannerEnabled: boolean;
}> = props => {
  return (
    <DocumentTitle title={getPageTitle(PAGE_TITLE.FAQ)}>
      <Iframe
        url="https://faq.oncokb.org"
        className={
          props.userMessageBannerEnabled ? 'faq-iframe-high-top' : 'faq-iframe'
        }
      />
    </DocumentTitle>
  );
};
const FAQPage = inject((stores: any) => ({
  userMessageBannerEnabled: stores.appStore.userMessageBannerEnabled,
}))(FAQPageContent);
export default FAQPage;
