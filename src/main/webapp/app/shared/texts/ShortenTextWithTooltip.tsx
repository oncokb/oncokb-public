import React from 'react';
import WithSeparator from 'react-with-separator';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { COLOR_BLUE } from 'app/config/theme';

const ShortenTextWithTooltip: React.FunctionComponent<{
  threshold: number;
  data: string[] | JSX.Element[];
}> = props => {
  if (props.data.length > props.threshold) {
    return (
      <>
        {props.data[0]} and{' '}
        <DefaultTooltip
          overlay={
            <div style={{ maxWidth: '400px' }}>
              <WithSeparator separator={', '}>
                {props.data.slice(1)}
              </WithSeparator>
            </div>
          }
          overlayStyle={{
            opacity: 1,
          }}
          placement="right"
          destroyTooltipOnHide={true}
        >
          <span
            style={{
              textDecoration: 'underscore',
              color: COLOR_BLUE,
            }}
          >
            {props.data.length - 1} other alterations
          </span>
        </DefaultTooltip>
      </>
    );
  } else {
    return <WithSeparator separator={', '}>{props.data}</WithSeparator>;
  }
};
export default ShortenTextWithTooltip;
