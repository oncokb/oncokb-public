import React from 'react';
import FormSelectWithLabelField from 'app/shared/select/FormSelectWithLabelField';
import FormInputField from 'app/shared/input/FormInputField';
import { CompanyAdditionalInfoDTO } from 'app/shared/api/generated/API';
import { FormTextAreaField } from 'app/shared/textarea/FormTextAreaField';

const defaultAdditionalInfo: CompanyAdditionalInfoDTO = {
  license: {
    autoRenewal: false,
    activation: '',
    termination: {
      date: '',
      notes: '',
      notificationDays: 0,
    },
  },
};

type ICompanyAdditionalInfo = {
  setAdditionalInfo: (
    additionalInfo: CompanyAdditionalInfoDTO | null | undefined
  ) => void;
  additionalInfo: CompanyAdditionalInfoDTO | null | undefined;
  mode: 'create' | 'update';
};

export default function CompanyAdditionalInfo({
  additionalInfo,
  setAdditionalInfo,
  mode,
}: ICompanyAdditionalInfo) {
  const boldLabel = mode === 'update';

  return (
    <>
      <FormInputField
        id="activation"
        label="Activation"
        type="date"
        value={additionalInfo?.license?.activation}
        boldLabel={boldLabel}
        onChange={event => {
          setAdditionalInfo({
            license: {
              ...defaultAdditionalInfo.license,
              ...additionalInfo?.license,
              activation: event.target.value,
            },
          });
        }}
      />
      <FormSelectWithLabelField
        labelText="Auto-Renewal"
        name="auto-renewal"
        boldLabel={boldLabel}
        defaultValue={{
          value: additionalInfo?.license?.autoRenewal,
          label: additionalInfo?.license?.autoRenewal ? 'Yes' : 'No',
        }}
        options={[
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ]}
        onSelection={autoRenewalOption => {
          setAdditionalInfo({
            license: {
              ...defaultAdditionalInfo.license,
              ...additionalInfo?.license,
              autoRenewal: autoRenewalOption.value ?? false,
            },
          });
        }}
      />
      <FormInputField
        id="termination.notification-days"
        label="Termination Notification Days"
        type="number"
        value={additionalInfo?.license?.termination?.notificationDays}
        boldLabel={boldLabel}
        onChange={event => {
          const value = event.target.value;
          setAdditionalInfo({
            license: {
              ...defaultAdditionalInfo.license,
              ...additionalInfo?.license,
              termination: {
                ...defaultAdditionalInfo.license.termination,
                ...additionalInfo?.license.termination,
                notificationDays: value
                  ? +value
                  : ((undefined as unknown) as number),
              },
            },
          });
        }}
      />
      {mode === 'update' && (
        <>
          <FormInputField
            id="termination.date"
            label="Termination Date"
            type="date"
            value={additionalInfo?.license?.termination?.date}
            boldLabel={boldLabel}
            onChange={event => {
              setAdditionalInfo({
                license: {
                  ...defaultAdditionalInfo.license,
                  ...additionalInfo?.license,
                  termination: {
                    ...defaultAdditionalInfo.license.termination,
                    ...additionalInfo?.license.termination,
                    date: event.target.value,
                  },
                },
              });
            }}
          />
          <FormTextAreaField
            id="termination.notes"
            label="Termination Notes"
            value={additionalInfo?.license?.termination?.notes}
            boldLabel={boldLabel}
            onTextAreaChange={e => {
              setAdditionalInfo({
                license: {
                  ...defaultAdditionalInfo.license,
                  ...additionalInfo?.license,
                  termination: {
                    ...defaultAdditionalInfo.license.termination,
                    ...additionalInfo?.license.termination,
                    notes: e.target.value,
                  },
                },
              });
            }}
          />
        </>
      )}
    </>
  );
}
