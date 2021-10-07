import * as React from 'react';
import Iframe from 'react-iframe';
import { inject } from 'mobx-react';

const FAQPageContent: React.FunctionComponent<{
  userMessageBannerIsShown: boolean;
}> = props => {
  return (
    <Iframe
      url="https://faq.oncokb.org"
      className={
        props.userMessageBannerIsShown ? 'faq-iframe-high-top' : 'faq-iframe'
      }
    />
  );
};
const FAQPage = inject((stores: any) => ({
  userMessageBannerIsShown: stores.appStore.userMessageBannerIsShown,
}))(FAQPageContent);
export default FAQPage;
