import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { PAGE_ROUTE } from 'app/config/constants';
import WindowStore from 'app/store/WindowStore';
import axios from 'axios';
import { inject } from 'mobx-react';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CLIENT_ID } from './constants';

interface IEpicAuthenticateProps {
  windowStore: WindowStore;
}

const EpicAuthenticate = ({ windowStore }: IEpicAuthenticateProps) => {
  const url = useLocation();
  const urlParams = new URLSearchParams(url.search);

  const launchCode = urlParams.get('launch');
  const iss = urlParams.get('iss');

  useEffect(() => {
    if (iss) {
      localStorage.setItem('iss', iss);
    }
  }, [iss]);

  useEffect(() => {
    const authenticate = async () => {
      const response = await axios.get(`${iss}/metadata`);
      const data = response.data;
      const urlInfo = data.rest[0].security.extension[0].extension;
      const metadata = {
        authUrl: urlInfo[0].valueUri,
        tokenUrl: urlInfo[1].valueUri,
      };

      localStorage.setItem('tokenUrl', metadata.tokenUrl);

      window.location.href = `${metadata.authUrl}?scope=launch&response_type=code&redirect_uri=${windowStore.baseUrl}/${PAGE_ROUTE.EPIC_ANNOTATE}&client_id=${CLIENT_ID}&launch=${launchCode}&state=98wrghuwuogerg97&aud=${iss}`;
    };

    if (iss) {
      authenticate().catch(console.error);
    }
  }, [iss, windowStore.baseUrl]);

  return <LoadingIndicator isLoading />;
};

export default inject('windowStore')(EpicAuthenticate);
