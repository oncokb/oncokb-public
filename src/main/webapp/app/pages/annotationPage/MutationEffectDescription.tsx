import React from 'react';
import { AlterationPageLink } from 'app/shared/utils/UrlUtils';
import WithSeparator from 'react-with-separator';
import SummaryWithRefs from 'app/oncokb-frontend-commons/src/components/SummaryWithRefs';

const MutationEffectDescription: React.FunctionComponent<{
  hugoSymbol: string;
  description: string | undefined;
}> = props => {
  // Add link to alteration page when the allele is unknown but multiple alternative alleles at the same position have mutation effects
  const description = props.description || '';
  const addlMeSeparator = 'however, we have mutation effect descriptions for';
  if (description.includes(addlMeSeparator)) {
    const segments = description.split(addlMeSeparator);
    if (segments.length === 2) {
      // supposedly the last word is the alteration
      const varSegs = segments[1].split(' ');
      let alterationStr = varSegs.pop();
      if (alterationStr) {
        const altRegex = new RegExp('([A-Z]+[0-9]+)([A-Z]+(/[A-Z]+)*)', 'i');
        alterationStr = alterationStr.replace('.', '');
        if (altRegex.test(alterationStr)) {
          const matches = altRegex.exec(alterationStr);
          if (matches) {
            const positionalVar = matches[1];
            const alternativeAlleles = matches[2];
            const alleleLines = alternativeAlleles
              .split('/')
              .map((allele, index) => {
                return (
                  <AlterationPageLink
                    hugoSymbol={props.hugoSymbol}
                    alteration={`${positionalVar}${allele}`}
                  >
                    {index === 0 ? `${positionalVar}${allele}` : allele}
                  </AlterationPageLink>
                );
              });
            return (
              <span>
                {segments[0]} {addlMeSeparator}
                {varSegs.join(' ')}{' '}
                <WithSeparator separator={'/'}>{alleleLines}</WithSeparator>.
              </span>
            );
          }
        }
      }
    }
  }
  // don't do anything but add reference links in the description
  return <SummaryWithRefs content={props.description} type="linkout" />;
};

export default MutationEffectDescription;
