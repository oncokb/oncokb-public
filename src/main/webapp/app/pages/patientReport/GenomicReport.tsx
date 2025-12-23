import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from 'react-bootstrap';
import { DownloadButton } from '../../components/downloadButton/DownloadButton';
import AuthenticationStore from '../../store/AuthenticationStore';
import cnaTsv from './cna.tsv';
import mutationTsv from './mutation.tsv';
import structuralTsv from './structural.tsv';

interface IGenomicReportPageProps {
  authenticationStore: AuthenticationStore;
}

@inject('authenticationStore')
@observer
export default class GenomicReportPage extends React.Component<
  IGenomicReportPageProps
> {
  render() {
    return (
      <>
        <h2 className={'mb-3'}>OncoKB Genomic Report</h2>
        <div className="mb-2">
          The OncoKB genomic report provides a structured interface for
          uploading and interacting with sample-level data. Alteration data can
          be entered manually or uploaded as a TSV. Example TSVs can be
          downloaded below.
        </div>
        <Button
          className="mb-3"
          size="lg"
          onClick={() => {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://beta.report.oncokb.org/report/oncokb';
            form.target = '_blank';

            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'token';
            tokenInput.value = this.props.authenticationStore.idToken;

            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
          }}
        >
          Launch
        </Button>
        <div className="mb-3">
          <h5>Example Data</h5>
          <div>
            <DownloadButton outline className="mr-2" href={mutationTsv}>
              Mutations
            </DownloadButton>
            <DownloadButton outline className="mr-2" href={cnaTsv}>
              Copy Number Alterations
            </DownloadButton>
            <DownloadButton outline href={structuralTsv}>
              Structural Variants
            </DownloadButton>
          </div>
        </div>
      </>
    );
  }
}
