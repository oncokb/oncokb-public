import * as React from 'react';
import Iframe from 'react-iframe';

export const FAQPage: React.FunctionComponent<{}> = () => {
  return <Iframe url="https://faq.oncokb.org" className={'faq-iframe'} />;
};
