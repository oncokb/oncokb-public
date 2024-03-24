import React from 'react';
import { Button } from 'react-bootstrap';

import InfoIcon from 'app/shared/icons/InfoIcon';
import { SimpleTable } from 'app/components/SimpleTable';

import styles from './index.module.scss';

export interface ISearchInfoIcon {
  onSelectQuery: (query: string) => void;
}

export default class SearchInfoIcon extends React.Component<
  ISearchInfoIcon,
  any
> {
  constructor(props: Readonly<ISearchInfoIcon>) {
    super(props);
  }

  getQueryLink = (content: string) => {
    return (
      <Button
        variant="link"
        size={'sm'}
        style={{ padding: 0 }}
        onClick={() => this.props.onSelectQuery(content)}
      >
        {content}
      </Button>
    );
  };
  getOverlay = () => {
    return (
      <>
        <SimpleTable
          tableClassName={styles.simpleTable}
          columns={[
            {
              name: 'Query Type',
            },
            {
              name: 'Example',
            },
          ]}
          rows={[
            {
              key: 'gene',
              content: [
                { key: 'gene-0', content: 'Gene' },
                {
                  key: 'gene-1',
                  content: this.getQueryLink('BRAF'),
                },
              ],
            },
            {
              key: 'alteration',
              content: [
                { key: 'alteration-0', content: 'Alteration' },
                {
                  key: 'alteration-1',
                  content: this.getQueryLink('BRAF V600E'),
                },
              ],
            },
            {
              key: 'cancerType',
              content: [
                { key: 'cancerType-0', content: 'Cancer Type' },
                {
                  key: 'cancerType-1',
                  content: this.getQueryLink('Melanoma'),
                },
              ],
            },
            {
              key: 'drug',
              content: [
                { key: 'drug-0', content: 'Drug' },
                {
                  key: 'drug-1',
                  content: this.getQueryLink('Vemurafenib'),
                },
              ],
            },
            {
              key: 'hgvsg',
              content: [
                { key: 'hgvsg-0', content: 'HGVSg' },
                {
                  key: 'hgvsg-1',
                  content: this.getQueryLink('7:g.140453136A>T'),
                },
              ],
            },
            {
              key: 'gc',
              content: [
                { key: 'gc-0', content: 'Genomic Change' },
                {
                  key: 'gc-1',
                  content: this.getQueryLink('7,140453136,140453136,A,T'),
                },
              ],
            },
          ]}
        />
        <div style={{ fontStyle: 'italic' }}>
          <div>Notes:</div>
          <div>
            <ul style={{ marginBottom: 0 }}>
              <li>The search box supports blurry search</li>
              <li>
                HGVSg and GC searches default to GRCh37. To search variants in
                GRCh38, please add GRCh38 as prefix. Example:{' '}
                {this.getQueryLink('grch38:7:g.140753336A>T')},{' '}
                {this.getQueryLink('grch38:7,140753336,140753336,A,T')}
              </li>
            </ul>
          </div>
        </div>
      </>
    );
  };

  render() {
    return (
      <InfoIcon
        type={'info'}
        placement={'top'}
        overlay={this.getOverlay()}
        overlayClassName={'oncokb-search-overlay'}
      />
    );
  }
}
