import React from 'react';
import {
  AlterationPageLink,
  getAlternativeAllelesPageLinks,
} from 'app/shared/utils/UrlUtils';
import WithSeparator from 'react-with-separator';
import SummaryWithRefs from 'app/oncokb-frontend-commons/src/components/SummaryWithRefs';
import { ALTERNATIVE_ALLELES_REGEX } from 'app/config/constants/regex';

const MutationEffectDescription: React.FunctionComponent<{
  hugoSymbol: string;
  description: string | undefined;
}> = props => {
  // Add link to alteration page when the allele is unknown but multiple alternative alleles at the same position have mutation effects
  const description = props.description || '';
  const additionalMutationEffectSeparator =
    'we have mutation effect description';
  if (description.includes(additionalMutationEffectSeparator)) {
    const segments = description.split(additionalMutationEffectSeparator);
    if (segments.length === 2) {
      // supposedly the last word is the alteration
      const varSegs = segments[1].split(' ');
      let alterationStr = varSegs.pop();
      if (alterationStr) {
        const altRegex = ALTERNATIVE_ALLELES_REGEX;
        alterationStr = alterationStr.replace('.', '');
        if (altRegex.test(alterationStr)) {
          const matches = altRegex.exec(alterationStr);
          if (matches) {
            return (
              <span>
                {segments[0]} {additionalMutationEffectSeparator}
                {varSegs.join(' ')}{' '}
                {getAlternativeAllelesPageLinks(
                  props.hugoSymbol,
                  alterationStr
                )}
              </span>
            );
          }
        }
      }
    }
  }

  // Separate leading sentence when mutation effect comes from relevant alteration
  const relevantAltMutationEffectSeparator = ' is: ';
  if (description.includes(relevantAltMutationEffectSeparator)) {
    const segments = description.split(relevantAltMutationEffectSeparator);
    if (segments.length === 2) {
      return (
        <div>
          <p>
            {segments[0]} {relevantAltMutationEffectSeparator}
          </p>
          <SummaryWithRefs content={segments[1]} type="linkout" />
        </div>
      );
    }
  }

  // don't do anything but add reference links in the description
  return <SummaryWithRefs content={props.description} type="linkout" />;
};

export default MutationEffectDescription;
