import React from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { Token } from 'app/shared/api/generated/API';
import { daysDiff, secDiff } from 'app/shared/utils/Utils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import pluralize from 'pluralize';
import CopyToClipboard from 'react-copy-to-clipboard';
import classnames from 'classnames';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
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

  getDuration(expireInDays: number, expireInHours: number) {
    return expireInDays > 0
      ? `${expireInDays} ${pluralize('day', expireInDays)}`
      : `${expireInHours} ${pluralize('hour', expireInHours)}`;
  }

  render() {
    return (
      <>
        {this.props.tokens.map(token => {
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
                  <DefaultTooltip
                    placement={'top'}
                    overlay={
                      this.props.tokens.length < 2
                        ? 'You need to have one valid token'
                        : 'Delete the token'
                    }
                  >
                    <Button
                      variant={'primary'}
                      disabled={this.props.tokens.length < 2}
                      onClick={() => this.props.onDeleteToken(token)}
                    >
                      <i className={classnames('fa fa-trash')}></i>
                    </Button>
                  </DefaultTooltip>
                </InputGroup.Append>
              </InputGroup>
            </div>
          );
        })}
      </>
    );
  }
}
