import { FdaImplication } from 'app/store/AnnotationStore';
import _ from 'lodash';
import { LEVEL_PRIORITY, LEVELS } from 'app/config/constants';

const getFdaImplicationKey = (fdaImplication: FdaImplication) => {
  return `${fdaImplication.alteration.alteration}-${fdaImplication.cancerType}`;
};
export const getUniqueFdaImplications = (
  fdaImplications: FdaImplication[]
): FdaImplication[] => {
  const uniqueData: { [key: string]: FdaImplication[] } = _.groupBy(
    fdaImplications,
    (fdaImplication: FdaImplication) => {
      return getFdaImplicationKey(fdaImplication);
    }
  );
  const finalList: FdaImplication[] = [];
  for (const key in uniqueData) {
    if (uniqueData[key].length > 0) {
      finalList.push(
        _.sortBy(uniqueData[key], fdaImplication => {
          return LEVEL_PRIORITY.indexOf(fdaImplication.level as LEVELS);
        })[0]
      );
    }
  }
  return finalList;
};
