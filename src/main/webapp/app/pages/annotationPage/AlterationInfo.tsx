import React from 'react';
import { MutationEffectResp } from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  citationsHasInfo,
  OncoKBOncogenicityIcon,
} from 'app/shared/utils/Utils';
import { CitationTooltip } from 'app/components/CitationTooltip';
import {
  COLOR_ICON_WITH_INFO,
  COLOR_ICON_WITHOUT_INFO,
} from 'app/config/theme';
import { getHighestLevelStrings } from 'app/pages/genePage/GenePage';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import WithSeparator from 'react-with-separator';
import { MUTATION_EFFECT, ONCOGENICITY } from 'app/config/constants';

export const AlterationInfo: React.FunctionComponent<{
  oncogenicity: string | undefined;
  mutationEffect: MutationEffectResp | undefined;
  isVus: boolean;
  highestSensitiveLevel: string | undefined;
  highestResistanceLevel: string | undefined;
  highestDiagnosticImplicationLevel: string | undefined;
  highestPrognosticImplicationLevel: string | undefined;
}> = props => {
  const separator = <span className="mx-1">·</span>;
  const content = [];
  content.push(
    <span key={'oncogenicityContainer'} style={{ display: 'flex' }}>
      <span key="oncogenicity">
        {!props.oncogenicity || props.oncogenicity === ONCOGENICITY.UNKNOWN
          ? `${ONCOGENICITY.UNKNOWN} Oncogenic Effect`
          : props.oncogenicity}
      </span>
      <OncoKBOncogenicityIcon
        oncogenicity={props.oncogenicity}
        isVus={props.isVus}
      />
    </span>
  );

  if (props.mutationEffect) {
    const hasCitations = citationsHasInfo(props.mutationEffect.citations);
    const tooltipOverlay = () => (
      <CitationTooltip
        pmids={props.mutationEffect!.citations.pmids}
        abstracts={props.mutationEffect!.citations.abstracts}
      />
    );
    content.push(
      <span key="mutationEffectContainer">
        <span key="mutationEffect">
          {props.mutationEffect.knownEffect === MUTATION_EFFECT.UNKNOWN
            ? `${MUTATION_EFFECT.UNKNOWN} Biological Effect`
            : props.mutationEffect.knownEffect}
        </span>
        {hasCitations ? (
          <DefaultTooltip overlay={tooltipOverlay} key="mutationEffectTooltip">
            <i
              className="fa fa-book mx-1"
              style={{
                fontSize: '0.8em',
                color: hasCitations
                  ? COLOR_ICON_WITH_INFO
                  : COLOR_ICON_WITHOUT_INFO,
              }}
            ></i>
          </DefaultTooltip>
        ) : null}
      </span>
    );
  }
  if (
    props.highestSensitiveLevel ||
    props.highestResistanceLevel ||
    props.highestDiagnosticImplicationLevel ||
    props.highestPrognosticImplicationLevel
  ) {
    content.push(
      getHighestLevelStrings(
        props.highestSensitiveLevel,
        props.highestResistanceLevel,
        props.highestDiagnosticImplicationLevel,
        props.highestPrognosticImplicationLevel,
        separator
      )
    );
  }
  return (
    <div className="mt-2">
      <h5 className={'d-flex align-items-center flex-wrap'}>
        <WithSeparator separator={separator}>{content}</WithSeparator>
      </h5>
    </div>
  );
};
