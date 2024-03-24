import * as React from 'react';
import RefComponent from './RefComponent';
import { REF_CAPTURE } from 'app/config/constants/regex';

type SummaryWithRefsProps = {
  content: string | undefined;
  type: 'tooltip' | 'linkout';
};

export default class SummaryWithRefs extends React.Component<
  SummaryWithRefsProps
> {
  render() {
    if (!this.props.content) {
      return <span />;
    }

    const content: Array<JSX.Element> = [];

    // split the string with delimiters included
    const parts = this.props.content.split(REF_CAPTURE);

    parts.forEach((part: string) => {
      // if delimiter convert to a JSX component
      if (part.match(REF_CAPTURE)) {
        content.push(
          <RefComponent
            componentType={this.props.type}
            content={part}
            key={content.length}
          />
        );
      } else {
        content.push(<span key={content.length}>{part}</span>);
      }
    });

    return <span>{content}</span>;
  }
}
