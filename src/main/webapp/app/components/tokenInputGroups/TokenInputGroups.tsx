import React from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { Token } from 'app/shared/api/generated/API';
import { daysDiff, secDiff } from 'app/shared/utils/Utils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import pluralize from 'pluralize';
import classnames from 'classnames';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { CalendarButton } from 'app/components/calendarButton/CalendarButton';
import { CopyButton } from 'app/shared/button/CopyButton';

type TokenInputGroupsProps = {
  changeTokenExpirationDate: boolean;
  tokens: Token[];
  onDeleteToken: (token: Token) => void;
  extendExpirationDate?: (token: Token, newDate: string) => void;
};

@observer
export default class TokenInputGroups extends React.Component<
  TokenInputGroupsProps
> {
  constructor(props: TokenInputGroupsProps) {
    super(props);
  }

  @computed
  get sortedTokens() {
    return this.props.tokens.sort((a, b) => {
      return (
        new Date(a.expiration).getTime() - new Date(b.expiration).getTime()
      );
    });
  }

  @computed
  get deleteTokenAllowed() {
    return this.props.tokens.length >= 2;
  }

  getDuration(expireInDays: number, expireInHours: number) {
    return expireInDays > 0
      ? `${expireInDays} ${pluralize('day', expireInDays)}`
      : `${expireInHours} ${pluralize('hour', expireInHours)}`;
  }

  render() {
    return (
      <>
        {this.sortedTokens.map((token: Token, index: number) => {
          const expirationDay = daysDiff(token.expiration);
          const expirationHour = secDiff(token.expiration);
          return (
            <div key={token.id} className={'mb-2'}>
              <InputGroup size={'sm'}>
                <FormControl
                  value={token.token}
                  type={'text'}
                  contentEditable={false}
                  disabled={true}
                />
                <InputGroup.Append>
                  <InputGroup.Text id="btnGroupAddon">
                    Expires in {this.getDuration(expirationDay, expirationHour)}
                  </InputGroup.Text>
                </InputGroup.Append>
                {this.props.changeTokenExpirationDate && (
                  <CalendarButton
                    currentDate={token.expiration}
                    afterChangeDate={(newDate: string) => {
                      if (this.props.extendExpirationDate)
                        this.props.extendExpirationDate(token, newDate);
                    }}
                  />
                )}
                <InputGroup.Append>
                  <CopyButton text={token.token} />
                </InputGroup.Append>
                <DefaultTooltip
                  placement={'top'}
                  overlay={
                    this.deleteTokenAllowed
                      ? 'Delete the token'
                      : 'You need to have one valid token'
                  }
                >
                  <InputGroup.Append>
                    <Button
                      variant={'primary'}
                      onClick={() => this.props.onDeleteToken(token)}
                      disabled={!this.deleteTokenAllowed}
                      style={
                        !this.deleteTokenAllowed
                          ? { pointerEvents: 'none' }
                          : {}
                      }
                    >
                      <i className={classnames('fa fa-trash')}></i>
                    </Button>
                  </InputGroup.Append>
                </DefaultTooltip>
              </InputGroup>
            </div>
          );
        })}
      </>
    );
  }
}
