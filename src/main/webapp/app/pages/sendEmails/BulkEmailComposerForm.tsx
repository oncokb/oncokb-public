import React from 'react';
import Select from 'react-select';
import { LoadingButton } from 'app/shared/button/LoadingButton';
import { Button } from 'react-bootstrap';
import styles from './BulkEmailComposerForm.module.scss';

type Option = {
  value: string;
  label: string;
};

export type NewsStoryLink = {
  text: string;
  url: string;
};

export type NewsStory = {
  title: string;
  paragraphs: string[];
  links?: NewsStoryLink[];
};

export type NewsTemplatePayload = {
  title: string;
  today: string;
  stories: NewsStory[];
};

export enum BulkEmailAudience {
  CUSTOM = 'CUSTOM',
  ALL_USERS = 'ALL_USERS',
  DEVELOPERS = 'DEVELOPERS',
  SCIENTIFIC_NEWS = 'SCIENTIFIC_NEWS',
}

type Props = {
  fromOptions: Option[];
  selectedFrom: string;
  audience: BulkEmailAudience;
  recipientOptions: Option[];
  selectedRecipients: Option[];
  isLoadingRecipients: boolean;
  isSending: boolean;
  canSend: boolean;
  dynamicContentValue: NewsTemplatePayload;
  dynamicContentError?: string;
  onAudienceChange: (audience: BulkEmailAudience) => void;
  onRecipientsChange: (recipients: Option[]) => void;
  onFromChange: (from: string) => void;
  onDynamicContentChange: (value: NewsTemplatePayload) => void;
  onRecipientSearchChange: (keyword: string, action: string) => void;
  onSendClick: () => void;
};

const AUDIENCE_OPTIONS: { value: BulkEmailAudience; label: string }[] = [
  { value: BulkEmailAudience.CUSTOM, label: 'Custom Recipients' },
  { value: BulkEmailAudience.ALL_USERS, label: 'All Users' },
  { value: BulkEmailAudience.DEVELOPERS, label: 'Developers' },
  { value: BulkEmailAudience.SCIENTIFIC_NEWS, label: 'Scientific News' },
];

const BulkEmailComposerForm = ({
  fromOptions,
  selectedFrom,
  audience,
  recipientOptions,
  selectedRecipients,
  isLoadingRecipients,
  isSending,
  canSend,
  dynamicContentValue,
  dynamicContentError,
  onAudienceChange,
  onRecipientsChange,
  onFromChange,
  onDynamicContentChange,
  onRecipientSearchChange,
  onSendClick,
}: Props) => {
  const updateDynamicContent = (
    updater: (value: NewsTemplatePayload) => NewsTemplatePayload
  ) => {
    onDynamicContentChange(updater(dynamicContentValue));
  };

  const updateStory = (
    storyIndex: number,
    updater: (story: NewsStory) => NewsStory
  ) => {
    updateDynamicContent(content => ({
      ...content,
      stories: content.stories.map((story, index) =>
        index === storyIndex ? updater(story) : story
      ),
    }));
  };

  return (
    <section
      className={styles.formCard}
      aria-labelledby="bulk-email-builder-title"
    >
      <form
        onSubmit={event => {
          event.preventDefault();
          onSendClick();
        }}
      >
        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldLabel}>Audience</legend>
          <Select
            inputId="bulk-audience"
            isSearchable={false}
            value={AUDIENCE_OPTIONS.find(option => option.value === audience)}
            options={AUDIENCE_OPTIONS}
            onChange={(selectedOption: any) => {
              onAudienceChange(
                selectedOption
                  ? (selectedOption.value as BulkEmailAudience)
                  : BulkEmailAudience.CUSTOM
              );
            }}
          />
        </fieldset>

        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldLabel}>Recipients</legend>
          <Select
            inputId="bulk-recipients"
            isLoading={isLoadingRecipients}
            isDisabled={audience !== BulkEmailAudience.CUSTOM}
            isMulti
            closeMenuOnSelect={false}
            placeholder="Select users"
            value={selectedRecipients}
            options={recipientOptions}
            isClearable
            onInputChange={(inputValue: string, meta: { action: string }) => {
              onRecipientSearchChange(inputValue, meta.action);
              return inputValue;
            }}
            onChange={(selectedOption: any) => {
              const options = Array.isArray(selectedOption)
                ? selectedOption
                : [];
              onRecipientsChange(options);
            }}
          />
        </fieldset>

        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldLabel}>From</legend>
          <Select
            inputId="bulk-from"
            isSearchable={false}
            value={
              fromOptions.find(option => option.value === selectedFrom) || null
            }
            options={fromOptions}
            onChange={(selectedOption: any) =>
              onFromChange(selectedOption ? selectedOption.value : '')
            }
          />
        </fieldset>

        <fieldset className={styles.fieldGroup}>
          <div>
            <label htmlFor="bulk-email-title" className={styles.fieldLabel}>
              Email Title
            </label>
            <input
              id="bulk-email-title"
              className={styles.textInput}
              value={dynamicContentValue.title}
              onChange={event =>
                updateDynamicContent(content => ({
                  ...content,
                  title: event.target.value,
                }))
              }
            />
          </div>
        </fieldset>

        <fieldset className={styles.fieldGroup}>
          <div className={styles.storyHeader}>
            <span className={styles.subLabel}>Stories</span>
            <Button
              variant="outline-secondary"
              size="sm"
              type="button"
              onClick={() =>
                updateDynamicContent(content => ({
                  ...content,
                  stories: [
                    ...content.stories,
                    { title: '', paragraphs: [''], links: [] },
                  ],
                }))
              }
            >
              Add Story
            </Button>
          </div>

          <ol>
            {dynamicContentValue.stories.map((story, storyIndex) => (
              <li key={storyIndex} className={styles.storyCard}>
                <div className={styles.storyCardHeader}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    type="button"
                    onClick={() =>
                      updateDynamicContent(content => ({
                        ...content,
                        stories: content.stories.filter(
                          (_, index) => index !== storyIndex
                        ),
                      }))
                    }
                  >
                    Remove Story
                  </Button>
                </div>

                <label
                  htmlFor={`story-title-${storyIndex}`}
                  className={styles.subLabel}
                >
                  Story Title
                </label>
                <input
                  id={`story-title-${storyIndex}`}
                  className={styles.textInput}
                  value={story.title}
                  onChange={event =>
                    updateStory(storyIndex, current => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />

                <div className={styles.inlineHeader}>
                  <span className={styles.subLabel}>Paragraphs</span>
                </div>
                <label
                  htmlFor={`story-${storyIndex}-paragraphs`}
                  className={styles.subLabel}
                >
                  One paragraph per line
                </label>
                <textarea
                  id={`story-${storyIndex}-paragraphs`}
                  className={styles.textArea}
                  value={story.paragraphs.join('\n')}
                  onChange={event => {
                    const paragraphs = event.target.value
                      .split(/\r?\n/)
                      .map(value => value.trim());

                    updateStory(storyIndex, current => ({
                      ...current,
                      paragraphs,
                    }));
                  }}
                />

                <div className={styles.inlineHeader}>
                  <span className={styles.subLabel}>Links (optional)</span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    type="button"
                    onClick={() =>
                      updateStory(storyIndex, current => ({
                        ...current,
                        links: [
                          ...(current.links || []),
                          { text: '', url: '' },
                        ],
                      }))
                    }
                  >
                    Add Link
                  </Button>
                </div>

                <ul>
                  {(story.links || []).map((link, linkIndex) => (
                    <li key={linkIndex} className={styles.linkGrid}>
                      <label
                        htmlFor={`story-${storyIndex}-link-${linkIndex}-text`}
                        className={styles.subLabel}
                      >
                        Link Text
                      </label>
                      <input
                        id={`story-${storyIndex}-link-${linkIndex}-text`}
                        className={styles.textInput}
                        placeholder="Link text"
                        value={link.text}
                        onChange={event =>
                          updateStory(storyIndex, current => ({
                            ...current,
                            links: (current.links || []).map((value, index) =>
                              index === linkIndex
                                ? { ...value, text: event.target.value }
                                : value
                            ),
                          }))
                        }
                      />
                      <label
                        htmlFor={`story-${storyIndex}-link-${linkIndex}-url`}
                        className={styles.subLabel}
                      >
                        Link URL
                      </label>
                      <input
                        id={`story-${storyIndex}-link-${linkIndex}-url`}
                        className={styles.textInput}
                        placeholder="Link URL"
                        value={link.url}
                        onChange={event =>
                          updateStory(storyIndex, current => ({
                            ...current,
                            links: (current.links || []).map((value, index) =>
                              index === linkIndex
                                ? { ...value, url: event.target.value }
                                : value
                            ),
                          }))
                        }
                      />
                      <div className={styles.linkActions}>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          type="button"
                          onClick={() =>
                            updateStory(storyIndex, current => ({
                              ...current,
                              links: (current.links || []).filter(
                                (_, index) => index !== linkIndex
                              ),
                            }))
                          }
                        >
                          Remove Link
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          {dynamicContentError && (
            <p className={styles.errorText}>{dynamicContentError}</p>
          )}
        </fieldset>

        <div className={styles.actions}>
          <LoadingButton
            variant="primary"
            type="submit"
            disabled={!canSend}
            loading={isSending}
          >
            Send
          </LoadingButton>
        </div>
      </form>
    </section>
  );
};

export default BulkEmailComposerForm;
