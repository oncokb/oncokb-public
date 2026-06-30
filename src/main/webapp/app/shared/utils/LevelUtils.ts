import { DEFAULT_ANNOTATION } from 'app/config/constants';
import {
  LevelInfo,
  SomaticVariantAnnotation,
} from 'app/shared/api/generated/OncoKbPrivateAPI';

export function getHighestSensitiveLevel(
  level: LevelInfo['highestSensitiveLevel']
): SomaticVariantAnnotation['highestSensitiveLevel'] {
  switch (level) {
    case 'LEVEL_1':
    case 'LEVEL_2':
    case 'LEVEL_3A':
    case 'LEVEL_3B':
    case 'LEVEL_4':
      return level;
    default:
      return DEFAULT_ANNOTATION.highestSensitiveLevel;
  }
}

export function getHighestDiagnosticImplicationLevel(
  level: LevelInfo['highestDiagnosticLevel']
): SomaticVariantAnnotation['highestDiagnosticImplicationLevel'] {
  switch (level) {
    case 'LEVEL_Dx1':
    case 'LEVEL_Dx2':
    case 'LEVEL_Dx3':
      return level;
    default:
      return DEFAULT_ANNOTATION.highestDiagnosticImplicationLevel;
  }
}

export function getHighestPrognosticImplicationLevel(
  level: LevelInfo['highestPrognosticLevel']
): SomaticVariantAnnotation['highestPrognosticImplicationLevel'] {
  switch (level) {
    case 'LEVEL_Px1':
    case 'LEVEL_Px2':
    case 'LEVEL_Px3':
      return level;
    default:
      return DEFAULT_ANNOTATION.highestPrognosticImplicationLevel;
  }
}

export function getHighestResistanceLevel(
  level: LevelInfo['highestResistanceLevel']
): SomaticVariantAnnotation['highestResistanceLevel'] {
  switch (level) {
    case 'LEVEL_R1':
    case 'LEVEL_R2':
      return level;
    default:
      return DEFAULT_ANNOTATION.highestResistanceLevel;
  }
}

export function getHighestFdaLevel(
  level: LevelInfo['highestFDALevel']
): SomaticVariantAnnotation['highestFdaLevel'] {
  switch (level) {
    case 'LEVEL_Fda1':
    case 'LEVEL_Fda2':
    case 'LEVEL_Fda3':
      return level;
    default:
      return DEFAULT_ANNOTATION.highestFdaLevel;
  }
}
