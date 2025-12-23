import React, { CSSProperties, useRef, useState } from 'react';
import CancerTypeSelect from './CancerTypeSelect';
import classnames from 'classnames';
import { COLOR_BLUE } from 'app/config/theme';
import styles from './SomaticGermlineCancerTypeSelect.module.scss';
import InfoIcon from '../icons/InfoIcon';
import { OncoTreeLink, getAlterationPageLink } from '../utils/UrlUtils';
import { StylesConfig } from 'react-select';
import { RouterStore } from 'mobx-react-router';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { components } from 'react-select';
import * as QueryString from 'query-string';
import { encodeSlash } from '../utils/Utils';
import { PAGE_ROUTE } from 'app/config/constants';

export default function SomaticGermlineCancerTypeSelect({
  cancerType,
  selectStyles,
  className,
  isClearable,
  pretext,
  routing,
  hugoSymbol,
  alterationQuery,
  germline,
  onchange,
  prioritizedCancerTypes,
}: {
  cancerType?: string;
  selectStyles?: StylesConfig;
  className?: string;
  isClearable?: boolean;
  pretext?: React.ReactNode;
  routing: RouterStore;
  hugoSymbol: string;
  alterationQuery: string;
  germline: boolean;
  onchange?: (cancerType: string) => void;
  prioritizedCancerTypes?: string[];
}) {
  const [isOverflowing, setIsOverflowing] = useState(false);

  const {
    control,
    indicatorsContainer,
    indicatorSeparator,
    dropdownIndicator,
    clearIndicator,
    valueContainer,
    input,
    menu,
    ...remainingStyles
  }: StylesConfig = selectStyles ?? {};
  return (
    <span
      className={classnames(
        styles.cancerTypeWrapper,
        'mr-2',
        'align-items-center',
        'justify-content-left',
        'd-flex'
      )}
    >
      {pretext && <span className="mr-2">{pretext}</span>}
      <span className={classnames('flex-grow-1')}>
        <CancerTypeSelect
          components={{
            Control({ children, ...rest }) {
              const selectControl = (
                <div>
                  <components.Control {...rest}>{children}</components.Control>
                </div>
              );

              if (!isOverflowing) {
                return selectControl;
              }

              return (
                <DefaultTooltip
                  placement="bottomLeft"
                  overlay={<>{cancerType}</>}
                >
                  {selectControl}
                </DefaultTooltip>
              );
            },
            SingleValue({ children, ...rest }) {
              return (
                <components.SingleValue {...rest}>
                  <div
                    ref={ref => {
                      if (ref) {
                        setIsOverflowing(ref.scrollWidth > ref.clientWidth);
                      }
                    }}
                    className="text-truncate"
                  >
                    {children}
                  </div>
                </components.SingleValue>
              );
            },
          }}
          styles={{
            control(base, props) {
              const newBase: CSSProperties = {
                ...base,
                borderBottomWidth: '1px',
                borderBottomColor: COLOR_BLUE,
                borderStyle: 'none',
                borderBottomStyle: 'solid',
                borderRadius: '0px',
              };
              newBase['&:hover'] = {
                borderBottomColor: COLOR_BLUE,
              };
              return control?.(newBase, props) ?? newBase;
            },
            indicatorsContainer(base, props) {
              const newBase: CSSProperties = {
                ...base,
              };

              (newBase['& div'] = {
                color: COLOR_BLUE,
              }),
                (newBase['& div:hover'] = {
                  color: COLOR_BLUE,
                });
              return indicatorsContainer?.(newBase, props) ?? newBase;
            },
            indicatorSeparator(base, props) {
              const newBase: CSSProperties = {
                ...base,
                width: '0px',
              };
              return indicatorSeparator?.(newBase, props) ?? newBase;
            },
            dropdownIndicator(base, props) {
              const newBase: CSSProperties = {
                ...base,
                padding: 4,
              };
              return dropdownIndicator?.(newBase, props) ?? newBase;
            },
            clearIndicator(base, props) {
              const newBase: CSSProperties = {
                ...base,
                padding: 4,
              };
              return clearIndicator?.(newBase, props) ?? newBase;
            },
            valueContainer(base, props) {
              const newBase: CSSProperties = {
                ...base,
                padding: '0px 6px',
              };
              return valueContainer?.(newBase, props) ?? newBase;
            },
            input(base, props) {
              const newBase: CSSProperties = {
                ...base,
                margin: 0,
                padding: 0,
              };
              return input?.(newBase, props) ?? newBase;
            },
            menu(base, props) {
              const newBase: CSSProperties = {
                ...base,
                zIndex: 10,
              };
              return menu?.(newBase, props) ?? newBase;
            },
            ...remainingStyles,
          }}
          className={className}
          isClearable={isClearable}
          cancerTypes={cancerType ? [cancerType] : undefined}
          onChange={value => {
            const path = routing.location.pathname.toLowerCase();
            const isGenomicPage =
              path.startsWith(`${PAGE_ROUTE.HGVSG}/`) ||
              path.startsWith(`${PAGE_ROUTE.GENOMIC_CHANGE}/`);

            const selectedValue =
              value && typeof value === 'object' && 'value' in value
                ? value.value
                : undefined;

            if (isGenomicPage) {
              const parsedSearch = QueryString.parse(
                routing.location.search
              ) as Record<string, any>;

              if (selectedValue) {
                parsedSearch.tumorType = encodeSlash(selectedValue);
                onchange?.(selectedValue);
              } else {
                delete parsedSearch.tumorType;
                onchange?.('');
              }

              routing.history.push({
                pathname: routing.location.pathname,
                search: QueryString.stringify(parsedSearch),
              });
              return;
            }

            if (selectedValue) {
              routing.history.push(
                getAlterationPageLink({
                  hugoSymbol,
                  alteration: alterationQuery,
                  germline,
                  cancerType: selectedValue,
                  withProtocolHostPrefix: false,
                })
              );
              onchange?.(selectedValue);
            }
          }}
          prioritizedCancerTypes={prioritizedCancerTypes}
        />
      </span>
      <span style={{ width: '1rem' }}></span>
      <InfoIcon
        overlay={
          <span>
            For cancer type specific information, please select a cancer type
            from the dropdown. The cancer type is curated using <OncoTreeLink />
          </span>
        }
        placement="top"
      />
      <span style={{ marginRight: '-0.5rem' }}></span>
    </span>
  );
}
