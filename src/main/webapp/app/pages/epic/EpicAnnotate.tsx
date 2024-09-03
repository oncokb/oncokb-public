import { SampleQueryResp } from 'app/shared/api/generated/OncoKbAPI';
import React, { useEffect, useState } from 'react';
import { CLIENT_ID } from './constants';
import { inject } from 'mobx-react';
import WindowStore from 'app/store/WindowStore';
import { PAGE_ROUTE } from 'app/config/constants';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

interface IEpicAnnotateProps {
  windowStore: WindowStore;
}

const EpicAnnotate = ({ windowStore }: IEpicAnnotateProps) => {
  const url = useLocation();
  const [samples, setSamples] = useState<SampleQueryResp[] | undefined>();

  useEffect(() => {
    const tokenUrl = localStorage.getItem('tokenUrl');
    const iss = localStorage.getItem('iss');

    const urlParams = new URLSearchParams(url.search);
    const code = urlParams.get('code');

    async function fetchAccessToken() {
      if (!tokenUrl || !iss || !code) {
        return; // decide what to do here
      }

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append(
        'redirect_uri',
        `${windowStore.baseUrl}/${PAGE_ROUTE.EPIC_ANNOTATE}`
      );
      params.append('code', code);
      params.append('client_id', CLIENT_ID);
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const epicResponse = await axios.post(tokenUrl, params, config);

      const token = epicResponse.data;

      //Pass ISS and token to backend, so it can use Epic APIs.
      const mskResponse = await axios.get(
        `/api/token?iss=${iss}&accessToken=${token.access_token}&patientId=${token.patient}`
      );
    }

    fetchAccessToken().catch(console.error);
  }, [url]);

  return <></>;
};

export default inject('windowStore')(EpicAnnotate);
