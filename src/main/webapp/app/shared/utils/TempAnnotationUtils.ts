import { ANNOTATION_PAGE_TAB_KEYS } from 'app/config/constants';

export function getTabDefaultActiveKey(
  hasTxData: boolean,
  hasDxData: boolean,
  hasPxData: boolean,
  hasFdaData: boolean,
  defaultSelectedTab?: ANNOTATION_PAGE_TAB_KEYS
) {
  let defaultTabBasedOnData = ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL;
  if (hasTxData) {
    defaultTabBasedOnData = ANNOTATION_PAGE_TAB_KEYS.TX;
  } else if (hasDxData) {
    defaultTabBasedOnData = ANNOTATION_PAGE_TAB_KEYS.DX;
  } else if (hasPxData) {
    defaultTabBasedOnData = ANNOTATION_PAGE_TAB_KEYS.PX;
  }

  switch (defaultSelectedTab) {
    case ANNOTATION_PAGE_TAB_KEYS.FDA:
      return hasFdaData ? ANNOTATION_PAGE_TAB_KEYS.FDA : defaultTabBasedOnData;
    case ANNOTATION_PAGE_TAB_KEYS.TX:
      return hasTxData ? ANNOTATION_PAGE_TAB_KEYS.TX : defaultTabBasedOnData;
    case ANNOTATION_PAGE_TAB_KEYS.DX:
      return hasDxData ? ANNOTATION_PAGE_TAB_KEYS.DX : defaultTabBasedOnData;
    case ANNOTATION_PAGE_TAB_KEYS.PX:
      return hasPxData ? ANNOTATION_PAGE_TAB_KEYS.PX : defaultTabBasedOnData;
    default:
      return defaultTabBasedOnData;
  }
}
