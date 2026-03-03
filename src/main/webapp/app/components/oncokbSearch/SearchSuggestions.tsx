import React from 'react';
import styles from './SearchSuggestions.module.scss';

export interface SearchSuggestionsProps {
  onInfoIconClick: () => void;
}

export const SearchSuggestions: React.FunctionComponent<SearchSuggestionsProps> = props => {
  return (
    <div className={`small text-muted mt-1 ${styles.option}`}>
      <div className={styles.title}>
        Didn't find what you need? Try one of the tips below
      </div>
      <ul className={styles.tipsList}>
        <li>If you are searching for a variant, include the gene name.</li>
        <li>
          If you are using 3-letter amino acid codes, make sure they are
          properly capitalized (e.g., "Val").
        </li>
        <li>
          See the{' '}
          <button
            type="button"
            className={styles.linkButton}
            onClick={props.onInfoIconClick}
          >
            info icon
          </button>{' '}
          to the right of search for more examples and tips.
        </li>
      </ul>
    </div>
  );
};
