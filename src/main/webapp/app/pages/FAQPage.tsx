import * as React from 'react';
import Iframe from 'react-iframe';
import { inject } from 'mobx-react';

const FAQPageContent: React.FunctionComponent<{
  userMessageBannerEnabled: boolean;
}> = props => {
  return (
    <Iframe
      url="https://faq.oncokb.org"
      className={
        props.userMessageBannerEnabled ? 'faq-iframe-high-top' : 'faq-iframe'
      }
    />
  );
};
const FAQPage = inject((stores: any) => ({
  userMessageBannerEnabled: stores.appStore.userMessageBannerEnabled,
}))(FAQPageContent);
export default FAQPage;
