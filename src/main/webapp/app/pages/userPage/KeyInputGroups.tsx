import React from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import InfoIcon from 'app/shared/icons/InfoIcon';
import ButtonWithTooltip from 'app/shared/button/ButtonWithTooltip';

type KeyInputGroupsProps = {
  keyVal?: string;
  onCreate?: () => void;
  onDelete?: () => void;
  infoOverlay?:
    | (() => React.ReactChild)
    | React.ReactChild
    | React.ReactFragment
    | React.ReactPortal;
};

export const KeyInputGroups: React.FunctionComponent<KeyInputGroupsProps> = props => {
  return (
    <div key={props.keyVal} className={'mb-2'}>
      <InputGroup>
        <FormControl
          value={props.keyVal || ''}
          type={'text'}
          contentEditable={false}
          disabled={true}
        />
        {!props.keyVal && props.onCreate && (
          <InputGroup.Append>
            <ButtonWithTooltip
              tooltipProps={{
                placement: 'top',
                overlay: 'Create a new key',
              }}
              buttonProps={{
                onClick: props.onCreate,
              }}
              buttonContent={<i className={'fa fa-refresh'}></i>}
            />
          </InputGroup.Append>
        )}
        {!!props.keyVal && (
          <>
            {props.infoOverlay && (
              <InputGroup.Append>
                <DefaultTooltip placement={'top'} overlay={props.infoOverlay}>
                  <InputGroup.Text>
                    <InfoIcon />
                  </InputGroup.Text>
                </DefaultTooltip>
              </InputGroup.Append>
            )}
            {props.onDelete && (
              <InputGroup.Append>
                <ButtonWithTooltip
                  tooltipProps={{
                    placement: 'top',
                    overlay: 'Delete the key',
                  }}
                  buttonProps={{
                    onClick: props.onDelete,
                  }}
                  buttonContent={<i className={'fa fa-trash'}></i>}
                />
              </InputGroup.Append>
            )}
          </>
        )}
      </InputGroup>
    </div>
  );
};
