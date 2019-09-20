import { TumorType } from 'app/shared/api/generated/OncoKbAPI';
import _ from 'lodash';

export function getCancerTypeNameFromOncoTreeType(oncoTreeType: TumorType): string {
  return oncoTreeType.name || oncoTreeType.mainType.name || 'NA';
}

export function levelOfEvidence2Level(levelOfEvidence: string) {
  return trimLevelOfEvidenceSubversion(levelOfEvidence).replace('LEVEL_', '');
}

export function trimLevelOfEvidenceSubversion(levelOfEvidence: string) {
  return _.replace(levelOfEvidence, new RegExp('[AB]'), '');
}
