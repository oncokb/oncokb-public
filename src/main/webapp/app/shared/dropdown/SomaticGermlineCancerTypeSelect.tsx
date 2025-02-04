import React from 'react';
import CancerTypeSelect from './CancerTypeSelect';
import classnames from 'classnames';
import { COLOR_BLUE } from 'app/config/theme';
import styles from 'app/pages/alterationPage/AlterationPage.module.scss';
import InfoIcon from '../icons/InfoIcon';
import { OncoTreeLink } from '../utils/UrlUtils';

export default function SomaticGermlineCancerTypeSelect({
  cancerType,
}: {
  cancerType?: string;
}) {
  return (
    <span
      className={classnames(
        styles.headerTumorTypeSelection,
        'mr-2',
        'align-items-center',
        'justify-content-left',
        'd-flex'
      )}
    >
      <span className={classnames('flex-grow-1')}>
        <CancerTypeSelect
          styles={{
            control: base => ({
              ...base,
              height: '30px',
              minHeight: '30px',
              borderBottomWidth: '1px',
              borderBottomColor: COLOR_BLUE,
              borderStyle: 'none',
              borderBottomStyle: 'solid',
              borderRadius: '0px',
              '&:hover': {
                borderBottomColor: COLOR_BLUE,
              },
            }),
            indicatorsContainer: base => ({
              ...base,
              '& div': {
                color: COLOR_BLUE,
              },
              '& div:hover': {
                color: COLOR_BLUE,
              },
            }),
            indicatorSeparator: base => ({
              ...base,
              width: '0px',
            }),
            dropdownIndicator: base => ({
              ...base,
              padding: 4,
            }),
            clearIndicator: base => ({
              ...base,
              padding: 4,
            }),
            valueContainer: base => ({
              ...base,
              padding: '0px 6px',
            }),
            input: base => ({
              ...base,
              margin: 0,
              padding: 0,
            }),
            menu: base => ({ ...base, zIndex: 10 }),
          }}
          cancerType={cancerType}
          onChange={(selectedOption: any) =>
            this.updateTumorTypeQuery(selectedOption)
          }
        />
      </span>
      <InfoIcon
        overlay={
          <span>
            For cancer type specific information, please select a cancer type
            from the dropdown. The cancer type is curated using <OncoTreeLink />
          </span>
        }
        placement="top"
      />
    </span>
  );
}
