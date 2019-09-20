import { TumorType } from 'app/shared/api/generated/OncoKbAPI';

export function getCancerTypeNameFromOncoTreeType(oncoTreeType: TumorType): string {
  return oncoTreeType.name || oncoTreeType.mainType.name || 'NA';
}

export function levelOfEvidence2Level(levelOfEvidence: string) {
  return levelOfEvidence.replace('LEVEL_', '');
}
