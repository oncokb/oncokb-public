import * as React from 'react';
import Iframe from 'react-iframe';
import { inject } from 'mobx-react';
import {
  API_DOCUMENT_LINK,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
} from 'app/config/constants';
import { getPageTitle } from 'app/shared/utils/Utils';
import { Helmet } from 'react-helmet-async';

const ApiDocumentationPageContent: React.FunctionComponent<{
  userMessageBannerEnabled: boolean;
}> = props => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle(PAGE_TITLE.API_DOCUMENTATION)}</title>
        <meta name="description" content={PAGE_DESCRIPTION.API_ACCESS} />
      </Helmet>
      <Iframe
        url={API_DOCUMENT_LINK}
        className={
          props.userMessageBannerEnabled
            ? 'gitbook-iframe-high-top'
            : 'gitbook-iframe'
        }
      />
    </>
  );
};

export const ApiDocumentationPage = inject((stores: any) => ({
  userMessageBannerEnabled: stores.appStore.userMessageBannerEnabled,
}))(ApiDocumentationPageContent);
