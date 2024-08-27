import React, { useEffect, useState } from 'react';
import { FormSelectWithLabelField } from 'app/shared/select/FormSelectWithLabelField';
import SimpleInput from 'app/shared/input/SimpleInput';

export type ParsedAdditionalInfo = {
  license?: {
    activation?: string;
    autoRenewal?: boolean;
    termination?: {
      notificationDays?: number;
      date?: string;
      notes?: string;
    };
  };
};

const defaultInfo: Required<ParsedAdditionalInfo> = {
  license: {
    termination: {},
  },
};

type ICompanyAdditionalInfo = {
  setAdditionalInfo: (additionalInfo: string | null | undefined) => void;
  additionalInfo: string | null | undefined;
  mode: 'create' | 'update';
};

export default function CompanyAdditionalInfo({
  additionalInfo,
  setAdditionalInfo,
  mode,
}: ICompanyAdditionalInfo) {
  const [parsedAdditionalInfo, setParsedAdditionalInfo] = useState<
    ParsedAdditionalInfo
  >(additionalInfo ? JSON.parse(additionalInfo) : defaultInfo);

  useEffect(() => {
    const parsed: ParsedAdditionalInfo = additionalInfo
      ? JSON.parse(additionalInfo)
      : defaultInfo;

    if (!parsed.license) {
      parsed.license = {
        ...defaultInfo.license,
      };
    } else if (!parsed.license.termination) {
      parsed.license.termination = {
        ...defaultInfo.license.termination,
      };
    }
    setParsedAdditionalInfo(parsed);
  }, [additionalInfo]);

  useEffect(() => {
    const stringified = JSON.stringify(parsedAdditionalInfo);
    setAdditionalInfo(stringified);
  }, [parsedAdditionalInfo]);

  const boldLabel = mode === 'update';

  return (
    <>
      <SimpleInput
        id="activation"
        label="Activation"
        type="date"
        value={parsedAdditionalInfo.license?.activation}
        boldLabel={boldLabel}
        onChange={date => {
          setParsedAdditionalInfo(x => {
            return {
              license: {
                ...x.license,
                activation: date,
              },
            };
          });
        }}
      />
      <FormSelectWithLabelField
        labelText={'Auto-Renewal'}
        name={'auto-renewal'}
        boldLabel={boldLabel}
        defaultValue={{
          value: parsedAdditionalInfo.license?.autoRenewal,
          label: parsedAdditionalInfo.license?.autoRenewal ? 'Yes' : 'No',
        }}
        options={[
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ]}
        onSelection={autoRenewal => {
          setParsedAdditionalInfo(x => {
            return {
              license: {
                ...x.license,
                autoRenewal: autoRenewal.value,
              },
            };
          });
        }}
      />
      <SimpleInput
        id="termination.notification-days"
        label="Termination Notification Days"
        type="number"
        value={parsedAdditionalInfo.license?.termination?.notificationDays}
        boldLabel={boldLabel}
        onChange={days => {
          setParsedAdditionalInfo(x => {
            return {
              license: {
                ...x.license,
                termination: {
                  ...x.license?.termination,
                  notificationDays: days ? +days : 0,
                },
              },
            };
          });
        }}
      />
      {mode === 'update' && (
        <>
          <SimpleInput
            id="termination.date"
            label="Termination Date"
            type="date"
            value={parsedAdditionalInfo.license?.termination?.date}
            boldLabel={boldLabel}
            onChange={date => {
              setParsedAdditionalInfo(x => {
                return {
                  license: {
                    ...x.license,
                    termination: {
                      ...x.license?.termination,
                      date,
                    },
                  },
                };
              });
            }}
          />
          <SimpleInput
            id="termination.notes"
            label="Termination Notes"
            type="text-area"
            value={parsedAdditionalInfo.license?.termination?.notes}
            boldLabel={boldLabel}
            onChange={notes => {
              setParsedAdditionalInfo(x => {
                return {
                  license: {
                    ...x.license,
                    termination: {
                      ...x.license?.termination,
                      notes,
                    },
                  },
                };
              });
            }}
          />
        </>
      )}
    </>
  );
}
