import React from 'react';
import InfoTile, { Category } from 'app/components/infoTile/InfoTile';
import {
  FdaLevelIcon,
  levelOfEvidence2Level,
  OncoKBLevelIcon,
} from 'app/shared/utils/Utils';

type LoETile = {
  highestSensitiveLevel: string | undefined;
  highestResistanceLevel: string | undefined;
  highestDiagnosticImplicationLevel?: string | undefined;
  highestPrognosticImplicationLevel?: string | undefined;
  highestFdaLevel?: string | undefined;
  className?: string;
};

const LoETile: React.FunctionComponent<LoETile> = props => {
  const categories: Category[] = [];
  if (props.highestSensitiveLevel || props.highestResistanceLevel) {
    categories.push({
      title: 'Therapeutic',
      content: (
        <div className={'d-flex'}>
          {props.highestSensitiveLevel && (
            <OncoKBLevelIcon
              size={'s2'}
              level={levelOfEvidence2Level(props.highestSensitiveLevel, false)}
              withDescription
            />
          )}
          {props.highestResistanceLevel && (
            <OncoKBLevelIcon
              size={'s2'}
              level={levelOfEvidence2Level(props.highestResistanceLevel, false)}
              withDescription
            />
          )}
        </div>
      ),
    });
  }
  if (props.highestDiagnosticImplicationLevel) {
    categories.push({
      title: 'Diagnostic',
      content: (
        <div>
          <OncoKBLevelIcon
            size={'s2'}
            level={levelOfEvidence2Level(
              props.highestDiagnosticImplicationLevel,
              false
            )}
            withDescription
          />
        </div>
      ),
    });
  }
  if (props.highestPrognosticImplicationLevel) {
    categories.push({
      title: 'Prognostic',
      content: (
        <div>
          <OncoKBLevelIcon
            size={'s2'}
            level={levelOfEvidence2Level(
              props.highestPrognosticImplicationLevel,
              false
            )}
            withDescription
          />
        </div>
      ),
    });
  }
  if (props.highestFdaLevel) {
    categories.push({
      title: 'FDA',
      content: (
        <div>
          <FdaLevelIcon
            size={'s2'}
            level={levelOfEvidence2Level(props.highestFdaLevel, false)}
          />
        </div>
      ),
    });
  }

  return (
    <InfoTile
      title={'Highest level of evidence'}
      categories={categories}
      className={props.className}
    />
  );
};

export default LoETile;
