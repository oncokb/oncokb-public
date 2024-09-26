import React from 'react';
import FormSelectWithLabelField from 'app/shared/select/FormSelectWithLabelField';
import FormInputField from 'app/shared/input/FormInputField';
import { CompanyAdditionalInfoDTO } from 'app/shared/api/generated/API';
import { FormTextAreaField } from 'app/shared/textarea/FormTextAreaField';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { AvField } from 'availity-reactstrap-validation';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type PartialCompanyAdditionalInfoDTO = DeepPartial<CompanyAdditionalInfoDTO>;

export function createDefaultAdditionalInfo(): PartialCompanyAdditionalInfoDTO {
  return {
    license: {
      autoRenewal: true,
      activation: new Date().toISOString(),
    },
  };
}

type ICompanyAdditionalInfo = {
  setAdditionalInfo: (
    additionalInfo: PartialCompanyAdditionalInfoDTO | null | undefined
  ) => void;
  additionalInfo: PartialCompanyAdditionalInfoDTO | null | undefined;
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
        value={additionalInfo?.license?.activation?.split('T')[0]}
        boldLabel={boldLabel}
        onChange={event => {
          setAdditionalInfo({
            license: {
              ...additionalInfo?.license,
              activation: event.target.value
                ? new Date(event.target.value).toISOString()
                : undefined,
            },
          });
        }}
      />
      <FormSelectWithLabelField
        labelText="Auto-Renewal"
        name="auto-renewal"
        boldLabel={boldLabel}
        defaultValue={{
          value: additionalInfo?.license?.autoRenewal ?? false,
          label: additionalInfo?.license?.autoRenewal ? 'Yes' : 'No',
        }}
        options={[
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ]}
        onSelection={autoRenewalOption => {
          setAdditionalInfo({
            license: {
              ...additionalInfo?.license,
              autoRenewal: autoRenewalOption.value ?? false,
            },
          });
        }}
      />
      {mode === 'update' && (
        <>
          {additionalInfo?.license?.activation && (
            <FormInputField
              id="termination.date"
              label="Termination Date"
              type="date"
              validate={{
                dateRange: {
                  format: 'YYYY-MM-DD',
                  start: {
                    value: additionalInfo?.license?.activation?.split('T')[0],
                  },
                  end: {
                    // max date
                    value: new Date(8640000000000000)
                      .toISOString()
                      .split('T')[0],
                  },
                },
              }}
              value={additionalInfo?.license?.termination?.date?.split('T')[0]}
              boldLabel={boldLabel}
              onChange={event => {
                const terminationDate = event.target.value
                  ? new Date(event.target.value)
                  : undefined;
                setAdditionalInfo({
                  license: {
                    ...additionalInfo?.license,
                    termination: {
                      ...additionalInfo?.license?.termination,
                      date: terminationDate?.toISOString(),
                      notificationDays:
                        additionalInfo?.license?.termination
                          ?.notificationDays !== undefined
                          ? additionalInfo?.license?.termination
                              ?.notificationDays
                          : 90,
                    },
                  },
                });
              }}
            />
          )}
          {additionalInfo?.license?.termination?.date && (
            <>
              <FormInputField
                id="termination.notification-days"
                label="Termination Notification Days"
                type="number"
                value={additionalInfo?.license?.termination?.notificationDays}
                boldLabel={boldLabel}
                infoIconOverlay={`Specify the number of days before the OncoKB
              license termination date when an email notification will be sent
              to the OncoKB team. Only one email will be sent.
              If the notification days are updated within this period,
              the email will be sent during the next daily notification job.`}
                onChange={event => {
                  const value = event?.target?.value;
                  setAdditionalInfo({
                    license: {
                      ...additionalInfo?.license,
                      termination: {
                        ...additionalInfo?.license?.termination,
                        notificationDays: value
                          ? +value
                          : ((undefined as unknown) as number),
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
                      ...additionalInfo?.license,
                      termination: {
                        ...additionalInfo?.license?.termination,
                        notes: e.target.value,
                      },
                    },
                  });
                }}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
