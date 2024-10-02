import { SampleQueryResp } from 'app/shared/api/generated/OncoKbAPI';
import React, { useEffect, useState } from 'react';
import { CLIENT_ID } from './constants';
import { inject } from 'mobx-react';
import WindowStore from 'app/store/WindowStore';
import { PAGE_ROUTE } from 'app/config/constants';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import client from 'app/shared/api/oncokbClientInstance';
import { AnnotationVisualisation } from 'app/components/annotationVisualization/AnnotationVisualisation';

interface IEpicAnnotateProps {
  windowStore: WindowStore;
}

const EpicAnnotate = ({ windowStore }: IEpicAnnotateProps) => {
  const url = useLocation();
  const [mutations, setMutations] = useState<any[]>([]);
  const [copyNumberAlterations, setCopyNumberAlterations] = useState<any[]>([]);
  const [structuralVariants, setStructuralVariants] = useState<any[]>([]);

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
        `${windowStore.baseUrl}${PAGE_ROUTE.EPIC_ANNOTATE}`
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

      const response = await client.annotateEpicGetUsingGET({
        accessToken: token.access_token,
        iss,
        patientId: token.patient,
      });

      let newMutations: any[] = [];
      let newCopyNumberAlterations: any[] = [];
      let newStructuralVariants: any[] = [];
      for (const sample of response || []) {
        newMutations = newMutations.concat(sample.mutations);
        newCopyNumberAlterations = newCopyNumberAlterations.concat(
          sample.copyNumberAlterations
        );
        newStructuralVariants = newStructuralVariants.concat(
          sample.structuralVariants
        );
      }

      /* eslint-disable no-console */
      console.log({
        newMutations,
        newCopyNumberAlterations,
        newStructuralVariants,
      });

      setMutations(newMutations);
      setCopyNumberAlterations(newCopyNumberAlterations);
      setStructuralVariants(newStructuralVariants);
    }

    fetchAccessToken().catch(console.error);
  }, [url]);

  return (
    <AnnotationVisualisation
      data={{
        mutationData: mutations,
        copyNumberAlterationData: copyNumberAlterations,
        structuralVariantData: structuralVariants,
      }}
      patientInfo={{
        patientId: '1',
        age: '24',
        gender: 'Male',
      }}
      notifications={[]}
    />
  );
};

export default inject('windowStore')(EpicAnnotate);
