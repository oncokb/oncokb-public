import { getNCBIlink } from 'cbioportal-frontend-commons';
import * as React from 'react';
import styles from './citationListGroupItem.module.scss';

type PmidItemProps = {
  title: string;
  author: string;
  source: string;
  date: string;
  pmid: string;
};

export default class PmidItem extends React.Component<PmidItemProps> {
  render() {
    return (
      <li key={this.props.pmid} className={styles.listGroupItem}>
        <a
          href={getNCBIlink(`/pubmed/${this.props.pmid}`)}
          className={styles.listGroupItemTitle}
          target="_blank"
          rel="noopener noreferrer"
        >
          <b>{this.props.title}</b>
        </a>
        <div className={styles.listGroupItemContent}>
          <span>
            {this.props.author} {this.props.source}. {this.props.date}
          </span>
          <span>PMID: {this.props.pmid}</span>
        </div>
      </li>
    );
  }
}
