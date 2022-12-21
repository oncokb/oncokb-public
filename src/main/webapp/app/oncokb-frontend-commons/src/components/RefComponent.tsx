import Tooltip from 'rc-tooltip';
import { getNCBIlink } from '../lib/urls';
import * as React from 'react';

import { ReferenceList } from './ReferenceList';

import mainStyles from './main.module.scss';

/* eslint-disable react/jsx-no-target-blank */
export default class RefComponent extends React.Component<{
  content: string;
  componentType: 'tooltip' | 'linkout';
}> {
  render() {
    const parts = this.props.content.split(/pmid|nct|abstract/i);

    if (parts.length < 2) {
      return <span>{this.props.content}</span>;
    }

    const abstractParts = parts[1].split(/(?=http)/i);
    const isAbstract = !(abstractParts.length < 2);

    let abstract = '';
    let abstractLink = '';
    const ids = parts[1].match(/[0-9]+/g);
    let prefix: string | undefined;
    let link: JSX.Element | undefined;

    if (isAbstract) {
      abstract = abstractParts[0].replace(/^[:\s]*/g, '').trim();
      abstractLink = abstractParts[1].replace(/[\\)]*$/g, '').trim();
      link = (
        <a target="_blank" rel="noopener noreferrer" href={abstractLink}>
          {abstract}
        </a>
      );
    } else {
      if (!ids) {
        return <span>{this.props.content}</span>;
      }

      if (this.props.content.toLowerCase().includes('pmid')) {
        prefix = 'PMID: ';
      } else if (this.props.content.toLowerCase().includes('nct')) {
        prefix = 'NCT';
      }

      if (prefix) {
        link = (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={getNCBIlink(`/pubmed/${ids.join(',')}`)}
          >
            {`${prefix}${ids.join(', ')}`}
          </a>
        );
      }
    }

    if (this.props.componentType === 'tooltip') {
      const pmids = isAbstract
        ? []
        : ids!.map((id: string) => parseInt(id, 10));
      const abstracts = isAbstract ? [{ abstract, link: abstractLink }] : [];
      const tooltipContent = () => (
        <div className={mainStyles['tooltip-refs']}>
          <ReferenceList pmids={pmids} abstracts={abstracts} />
        </div>
      );

      return (
        <span key={this.props.content}>
          {parts[0]}
          <Tooltip
            overlay={tooltipContent}
            placement="right"
            trigger={['hover', 'focus']}
            destroyTooltipOnHide={true}
          >
            <i className="fa fa-book" style={{ color: 'black' }} />
          </Tooltip>
          {`)`}
        </span>
      );
    } else if (link) {
      return (
        <span key={this.props.content}>
          {parts[0]}
          {link}
          {`)`}
        </span>
      );
    } else {
      return <span>{this.props.content}</span>;
    }
  }
}
