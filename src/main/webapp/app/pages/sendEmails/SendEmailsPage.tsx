import React from 'react';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
} from 'mobx';
import { inject, observer } from 'mobx-react';
import client from 'app/shared/api/clientInstance';
import {
  MailTypeInfo,
  SendEmailPageResponseDTO,
  SendEmailUserOptionDTO,
  UserMailsDTO,
} from 'app/shared/api/generated/API';
import { match } from 'react-router';
import { Col, Row } from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { COMPONENT_PADDING } from 'app/config/constants';
import Select from 'react-select';
import classnames from 'classnames';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import AuthenticationStore from 'app/store/AuthenticationStore';
import autobind from 'autobind-decorator';
import { LoadingButton } from 'app/shared/button/LoadingButton';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import { Else, If, Then } from 'react-if';
import { EmailTable } from 'app/shared/table/EmailTable';
import * as QueryString from 'query-string';
import { AdminSendEmailPageSearchQueries } from 'app/shared/route/types';
import { SortingRule } from 'react-table';
import BulkEmailComposerForm, {
  BulkEmailAudience,
  NewsTemplatePayload,
} from './BulkEmailComposerForm';

const USER_OPTIONS_PAGE_SIZE = 100;
const HISTORY_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

const DEFAULT_NEWS_DYNAMIC_CONTENT: NewsTemplatePayload = {
  title: '',
  today: '',
  stories: [],
};

function getDefaultNewsDynamicContent(): NewsTemplatePayload {
  return {
    ...DEFAULT_NEWS_DYNAMIC_CONTENT,
    today: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    stories: DEFAULT_NEWS_DYNAMIC_CONTENT.stories.map(story => ({
      ...story,
      paragraphs: [...story.paragraphs],
      links: story.links ? story.links.map(link => ({ ...link })) : undefined,
    })),
  };
}

enum EmailMode {
  SINGLE = 'SINGLE',
  BULK = 'BULK',
}

@inject('routing', 'authenticationStore')
@observer
export default class UserManagementPage extends React.Component<{
  routing: RouterStore;
  authenticationStore: AuthenticationStore;
  match: match;
}> {
  @observable sendingMail = false;
  @observable isLoadingPageData = false;
  @observable isLoadingUserOptions = false;
  @observable isLoadingHistory = false;

  @observable selectedUserLogin: string;
  @observable.shallow selectedUserLogins: string[] = [];
  @observable selectedMailType: MailTypeInfo | undefined;
  @observable emailMode: EmailMode = EmailMode.SINGLE;
  @observable bulkAudience: BulkEmailAudience = BulkEmailAudience.CUSTOM;
  @observable fromOptions: string[] = [];
  @observable selectedFrom = 'no-reply@oncokb.org';
  @observable showConfirmModal = false;
  @observable.ref
  bulkDynamicContent: NewsTemplatePayload = getDefaultNewsDynamicContent();

  @observable userOptions: SendEmailUserOptionDTO[] = [];
  @observable mailTypes: MailTypeInfo[] = [];
  @observable userSearch = '';

  @observable userMails: UserMailsDTO[] = [];
  @observable historyPage = 0;
  @observable historyPageSize = HISTORY_PAGE_SIZE;
  @observable historyPages = 1;
  @observable historyTotalCount = 0;
  @observable historySearchInput = '';
  @observable historySearchKeyword = '';
  @observable.shallow historySorted: SortingRule[] = [
    { id: 'sentDate', desc: true },
  ];

  readonly reactions: IReactionDisposer[] = [];
  userSearchDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
  historySearchDebounceTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    props: Readonly<{
      routing: RouterStore;
      authenticationStore: AuthenticationStore;
      match: match;
    }>
  ) {
    super(props);
    this.fetchSendEmailsPageData();

    this.reactions.push(
      reaction(
        () => this.selectedUserLogin,
        () => {
          this.selectedMailType = undefined;
          if (this.selectedUserLogin) {
            this.selectedUserLogins = [this.selectedUserLogin];
          }
        }
      ),
      reaction(
        () => [this.props.routing.location.search],
        ([hash]) => {
          const queryStrings = QueryString.parse(
            hash
          ) as AdminSendEmailPageSearchQueries;
          if (queryStrings.to) {
            this.selectedUserLogin = queryStrings.to;
            this.selectedUserLogins = [queryStrings.to];
            this.historySearchInput = queryStrings.to;
            this.historySearchKeyword = queryStrings.to;
            this.historyPage = 0;
          }
        },
        true
      ),
      reaction(
        () => ({
          q: this.historySearchKeyword,
          page: this.historyPage,
          size: this.historyPageSize,
          sorted: this.historySorted.map(
            sortRule => `${sortRule.id}:${sortRule.desc}`
          ),
        }),
        () => {
          this.getSentHistory();
        },
        { fireImmediately: true }
      )
    );
  }

  @autobind
  @action
  async sendEmail() {
    if (this.canSendEmail) {
      this.sendingMail = true;
      const recipients =
        this.emailMode === EmailMode.BULK
          ? Array.from(new Set(this.selectedUserLogins)).filter(Boolean)
          : [this.selectedUserLogin].filter(Boolean);

      try {
        if (this.isBulkMode) {
          const dynamicContentError = this.bulkDynamicContentError;
          const dynamicContent = this.parsedBulkDynamicContent;
          if (dynamicContentError) {
            notifyError(new Error(dynamicContentError));
            this.sendingMail = false;
            return;
          }
          const bulkRequest = {
            from: this.selectedFrom,
            cc: '',
            by: this.props.authenticationStore.account!.login,
            audience: this.bulkAudience,
            recipients,
            dynamicContent,
          } as any;
          const response = await client.sendBulkUserMailsUsingPOST({
            request: bulkRequest,
          });
          const message = response || `Sent ${recipients.length} emails.`;
          notifySuccess(message);
        } else {
          await client.sendUserMailsUsingPOST({
            to: recipients[0],
            from: this.selectedFrom,
            by: this.props.authenticationStore.account!.login,
            mailType: this.selectedMailType!.mailType,
          });
          notifySuccess('Sent the email.');
        }
        this.getSentHistory();
      } catch (error: any) {
        notifyError(error);
      } finally {
        action(() => {
          this.sendingMail = false;
        })();
      }
    }
  }

  @autobind
  @action
  async fetchSendEmailsPageData(query = '') {
    this.isLoadingUserOptions = true;
    if (this.mailTypes.length === 0) {
      this.isLoadingPageData = true;
    }
    try {
      const response = await client.getSendEmailsPageDataUsingGETWithHttpInfo({
        q: query,
        page: 0,
        size: USER_OPTIONS_PAGE_SIZE,
      });
      const fromResponse = await client.getMailsFromUsingGET({});

      const payload = response.body as SendEmailPageResponseDTO;
      this.userOptions = payload.users || [];
      this.mailTypes = payload.mailTypes || [];

      const defaultFrom = (payload as any).defaultFrom || 'no-reply@oncokb.org';
      const options = Array.from(
        new Set([...(fromResponse || []), defaultFrom, 'no-reply@oncokb.org'])
      );
      this.fromOptions = options;
      if (!this.selectedFrom || !options.includes(this.selectedFrom)) {
        this.selectedFrom = options.includes('no-reply@oncokb.org')
          ? 'no-reply@oncokb.org'
          : defaultFrom;
      }
    } catch (error) {
      notifyError(error);
    } finally {
      this.isLoadingUserOptions = false;
      this.isLoadingPageData = false;
    }
  }

  @autobind
  @action
  async getSentHistory() {
    this.isLoadingHistory = true;
    try {
      const response = await client.getSentHistoryUsingGETWithHttpInfo({
        q: this.historySearchKeyword || undefined,
        page: this.historyPage,
        size: this.historyPageSize,
        sort: this.historySorted.map(
          sortRule => `${sortRule.id},${sortRule.desc ? 'desc' : 'asc'}`
        ),
      });
      this.userMails = response.body || [];
      const totalCount = Number(response.header['x-total-count'] || 0);
      this.historyTotalCount = Number.isFinite(totalCount) ? totalCount : 0;
      this.historyPages = Math.max(
        1,
        Math.ceil(this.historyTotalCount / this.historyPageSize)
      );
    } catch (error) {
      notifyError(error);
    } finally {
      this.isLoadingHistory = false;
    }
  }

  @autobind
  @action
  handleHistoryFetchData(tableState: { page: number; pageSize: number }) {
    this.historyPage = tableState.page;
    this.historyPageSize = tableState.pageSize;
  }

  @autobind
  @action
  handleHistorySortedChange(newSorted: SortingRule[]) {
    this.historySorted =
      newSorted.length > 0 ? newSorted : [{ id: 'sentDate', desc: true }];
    this.historyPage = 0;
  }

  @autobind
  @action
  handleHistorySearchChange(keyword: string) {
    this.historySearchInput = keyword;
    if (this.historySearchDebounceTimeout) {
      clearTimeout(this.historySearchDebounceTimeout);
    }
    this.historySearchDebounceTimeout = setTimeout(
      action(() => {
        this.historySearchKeyword = this.historySearchInput;
        this.historyPage = 0;
      }),
      SEARCH_DEBOUNCE_MS
    );
  }

  @autobind
  @action
  handleUserSearchChange(inputValue: string) {
    this.userSearch = inputValue;
    if (this.userSearchDebounceTimeout) {
      clearTimeout(this.userSearchDebounceTimeout);
    }
    this.userSearchDebounceTimeout = setTimeout(() => {
      this.fetchSendEmailsPageData(this.userSearch);
    }, SEARCH_DEBOUNCE_MS);
  }

  @computed
  get canSendEmail() {
    const hasRecipient =
      this.emailMode === EmailMode.BULK
        ? this.bulkAudience === BulkEmailAudience.CUSTOM
          ? this.selectedUserLogins.length > 0
          : true
        : !!this.selectedUserLogin;
    const noDynamicContentError =
      !this.isBulkMode ||
      String(this.bulkDynamicContentError || '').length === 0;
    return (
      (!!this.isBulkMode || !!this.selectedMailType) &&
      hasRecipient &&
      noDynamicContentError
    );
  }

  @computed
  get selectedUser() {
    const result = this.userOptions.filter(
      user => user.login === this.selectedUserLogin
    );
    return result.length > 0 ? result[0] : undefined;
  }

  @computed
  get isBulkMode() {
    return this.emailMode === EmailMode.BULK;
  }

  @computed
  get userSelectOptions() {
    return this.userOptions.map(user => {
      const hasEmail = user.email && user.email !== user.login;
      return {
        value: user.login,
        label: hasEmail ? `${user.login} (${user.email})` : user.login,
      };
    });
  }

  @computed
  get selectedBulkRecipientOptions() {
    return this.selectedUserLogins.map(login => {
      const user = this.userOptions.find(option => option.login === login);
      const hasEmail = user?.email && user.email !== user.login;
      return {
        value: login,
        label: hasEmail ? `${login} (${user!.email})` : login,
      };
    });
  }

  @computed
  get fromSelectOptions() {
    return this.fromOptions.map(from => ({ value: from, label: from }));
  }

  @computed
  get parsedBulkDynamicContent(): any {
    return this.bulkDynamicContentError ? null : this.bulkDynamicContent;
  }

  @computed
  get bulkDynamicContentError(): string {
    return this.validateNewsTemplatePayload(this.bulkDynamicContent);
  }

  private validateNewsTemplatePayload(payload: any): string {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return 'Dynamic content must be a JSON object.';
    }

    const title = payload.title;
    if (typeof title !== 'string' || !title.trim()) {
      return 'Dynamic content must include title as a non-empty string.';
    }

    const today = payload.today;
    if (typeof today !== 'string' || !today.trim()) {
      return 'Dynamic content must include today as a non-empty string.';
    }

    const stories = payload.stories;
    if (!Array.isArray(stories)) {
      return 'Dynamic content must include stories as an array.';
    }

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      if (!story || typeof story !== 'object' || Array.isArray(story)) {
        return `Story ${i + 1} must be an object.`;
      }

      if (typeof story.title !== 'string' || !story.title.trim()) {
        return `Story ${i + 1} must include title as a non-empty string.`;
      }

      if (!Array.isArray(story.paragraphs)) {
        return `Story ${i + 1} must include paragraphs as an array.`;
      }

      for (let j = 0; j < story.paragraphs.length; j++) {
        if (typeof story.paragraphs[j] !== 'string') {
          return `Story ${i + 1} paragraph ${j + 1} must be a string.`;
        }
      }

      if (story.links !== undefined) {
        if (!Array.isArray(story.links)) {
          return `Story ${i + 1} links must be an array when provided.`;
        }
        for (let k = 0; k < story.links.length; k++) {
          const link = story.links[k];
          if (!link || typeof link !== 'object' || Array.isArray(link)) {
            return `Story ${i + 1} link ${k + 1} must be an object.`;
          }
          if (typeof link.text !== 'string' || !link.text.trim()) {
            return `Story ${i + 1} link ${
              k + 1
            } must include text as a non-empty string.`;
          }
          if (typeof link.url !== 'string' || !link.url.trim()) {
            return `Story ${i + 1} link ${
              k + 1
            } must include url as a non-empty string.`;
          }
        }
      }
    }

    return '';
  }

  @computed
  get historyFromIndex() {
    if (this.historyTotalCount === 0 || this.userMails.length === 0) {
      return 0;
    }
    return this.historyPage * this.historyPageSize + 1;
  }

  @computed
  get historyToIndex() {
    if (this.historyTotalCount === 0 || this.userMails.length === 0) {
      return 0;
    }
    return Math.min(
      this.historyTotalCount,
      this.historyPage * this.historyPageSize + this.userMails.length
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
    if (this.userSearchDebounceTimeout) {
      clearTimeout(this.userSearchDebounceTimeout);
    }
    if (this.historySearchDebounceTimeout) {
      clearTimeout(this.historySearchDebounceTimeout);
    }
  }

  render() {
    return (
      <If condition={!this.isLoadingPageData}>
        <Then>
          <Row className={getSectionClassName(true)}>
            <Col className={'d-flex justify-content-between'}>
              <h2>Send Emails</h2>
            </Col>
          </Row>
          <Row className={getSectionClassName()}>
            <Col className={classnames(...COMPONENT_PADDING)} lg={6} xs={12}>
              <div>
                <div className={'pb-2'}>Mode</div>
                <Select
                  isSearchable={false}
                  value={{
                    value: this.emailMode,
                    label:
                      this.emailMode === EmailMode.BULK
                        ? 'Bulk Email'
                        : 'Single Email',
                  }}
                  options={[
                    { value: EmailMode.SINGLE, label: 'Single Email' },
                    { value: EmailMode.BULK, label: 'Bulk Email' },
                  ]}
                  onChange={(selectedOption: any) => {
                    const mode = selectedOption
                      ? (selectedOption.value as EmailMode)
                      : EmailMode.SINGLE;
                    this.emailMode = mode;
                    if (mode === EmailMode.SINGLE) {
                      this.selectedUserLogin =
                        this.selectedUserLogins.length > 0
                          ? this.selectedUserLogins[0]
                          : '';
                    } else {
                      this.selectedUserLogins = this.selectedUserLogin
                        ? [this.selectedUserLogin]
                        : [];
                    }
                  }}
                />
              </div>
            </Col>
          </Row>
          {this.isBulkMode ? (
            <Row className={getSectionClassName()}>
              <Col className={classnames(...COMPONENT_PADDING)} lg={8} xs={12}>
                <BulkEmailComposerForm
                  fromOptions={this.fromSelectOptions}
                  selectedFrom={this.selectedFrom}
                  audience={this.bulkAudience}
                  recipientOptions={this.userSelectOptions}
                  selectedRecipients={this.selectedBulkRecipientOptions}
                  isLoadingRecipients={this.isLoadingUserOptions}
                  isSending={this.sendingMail}
                  canSend={this.canSendEmail}
                  dynamicContentValue={this.bulkDynamicContent}
                  dynamicContentError={this.bulkDynamicContentError}
                  onAudienceChange={(audience: BulkEmailAudience) => {
                    this.bulkAudience = audience;
                  }}
                  onRecipientsChange={recipients => {
                    this.selectedUserLogins = recipients
                      .map(option => option.value)
                      .filter(Boolean);
                  }}
                  onFromChange={from => {
                    this.selectedFrom = from;
                  }}
                  onDynamicContentChange={value => {
                    this.bulkDynamicContent = value;
                  }}
                  onRecipientSearchChange={(inputValue, actionType) => {
                    if (actionType === 'input-change') {
                      this.handleUserSearchChange(inputValue);
                    }
                  }}
                  onSendClick={() => (this.showConfirmModal = true)}
                />
              </Col>
            </Row>
          ) : (
            <>
              <Row>
                <Col
                  className={classnames(...COMPONENT_PADDING)}
                  lg={6}
                  xs={12}
                >
                  <div>
                    <div className={'pb-2'}>To</div>
                    <Select
                      isLoading={this.isLoadingUserOptions}
                      onInputChange={(
                        inputValue: string,
                        meta: { action: string }
                      ) => {
                        if (meta.action === 'input-change') {
                          this.handleUserSearchChange(inputValue);
                        }
                        return inputValue;
                      }}
                      placeholder={`Select the user to send email`}
                      value={
                        this.selectedUserLogin
                          ? {
                              value: this.selectedUserLogin,
                              label:
                                this.selectedUser?.email &&
                                this.selectedUser?.email !==
                                  this.selectedUser?.login
                                  ? `${this.selectedUser.login} (${this.selectedUser.email})`
                                  : this.selectedUserLogin,
                            }
                          : null
                      }
                      options={this.userSelectOptions}
                      isClearable={true}
                      onChange={(selectedOption: any) => {
                        this.selectedUserLogin = selectedOption
                          ? selectedOption.value
                          : '';
                      }}
                    />
                  </div>
                </Col>
                <Col
                  className={classnames(...COMPONENT_PADDING)}
                  lg={6}
                  xs={12}
                >
                  <div>
                    <div className={'pb-2'}>From</div>
                    <Select
                      isSearchable={false}
                      value={
                        this.selectedFrom
                          ? {
                              value: this.selectedFrom,
                              label: this.selectedFrom,
                            }
                          : null
                      }
                      onChange={(selectedOption: any) => {
                        this.selectedFrom = selectedOption
                          ? selectedOption.value
                          : '';
                      }}
                      options={this.fromSelectOptions}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col
                  className={classnames(...COMPONENT_PADDING)}
                  lg={6}
                  xs={12}
                >
                  <Select
                    placeholder={`Select the type of mail`}
                    value={
                      this.selectedMailType
                        ? {
                            value: this.selectedMailType.mailType,
                            label: this.selectedMailType.description,
                          }
                        : null
                    }
                    options={this.mailTypes.map(type => {
                      return {
                        value: type.mailType,
                        label: type.description,
                      };
                    })}
                    isClearable={true}
                    onChange={(selectedOption: any) =>
                      (this.selectedMailType = selectedOption
                        ? {
                            mailType: selectedOption.value,
                            description: selectedOption.label,
                          }
                        : undefined)
                    }
                  />
                </Col>
                <Col
                  className={classnames(...COMPONENT_PADDING)}
                  lg={6}
                  xs={12}
                >
                  <LoadingButton
                    variant="primary"
                    type="submit"
                    disabled={!this.canSendEmail}
                    onClick={() => (this.showConfirmModal = true)}
                    loading={this.sendingMail}
                  >
                    Send
                  </LoadingButton>
                </Col>
              </Row>
            </>
          )}
          <Row className={getSectionClassName()}>
            <Col
              className={'d-flex justify-content-between align-items-center'}
            >
              <h2>Emails Sent</h2>
              <div>
                {`Showing ${this.historyFromIndex}-${this.historyToIndex} of ${this.historyTotalCount}`}
              </div>
            </Col>
          </Row>
          <Row className={getSectionClassName()}>
            <Col>
              {this.userMails && (
                <EmailTable
                  data={this.userMails}
                  loading={this.isLoadingHistory}
                  showPagination={true}
                  manual
                  page={this.historyPage}
                  pageSize={this.historyPageSize}
                  pages={this.historyPages}
                  sorted={this.historySorted}
                  onSortedChange={this.handleHistorySortedChange}
                  onFetchData={this.handleHistoryFetchData}
                  serverSideSearch
                  searchKeyword={this.historySearchInput}
                  onSearchChange={this.handleHistorySearchChange}
                />
              )}
            </Col>
          </Row>
          <SimpleConfirmModal
            onCancel={() => (this.showConfirmModal = false)}
            onConfirm={() => {
              this.sendEmail();
              this.showConfirmModal = false;
            }}
            show={this.showConfirmModal}
          />
        </Then>
        <Else>
          <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
        </Else>
      </If>
    );
  }
}
