import { TumorType } from 'app/shared/api/generated/OncoKbAPI';
import _ from 'lodash';

export const InsertSourceLink = (str: string) => {
  // let regex = [/PMID:\s*([0-9]+,*\s*)+/ig, /NCT[0-9]+/ig];
  // let links = ['https://www.ncbi.nlm.nih.gov/pubmed/',
  //   'http://clinicaltrials.gov/show/'];
  // for (let j = 0, regexL = regex.length; j < regexL; j++) {
  //   let result = str.match(regex[j]);
  //
  //   if (result) {
  //     let uniqueResult = result.filter(function(elem, pos) {
  //       return result.indexOf(elem) === pos;
  //     });
  //     for (let i = 0, resultL = uniqueResult.length; i < resultL; i++) {
  //       let _datum = uniqueResult[i];
  //
  //       switch (j) {
  //         case 0:
  //           let _number = _datum.split(':')[1].trim();
  //           _number = _number.replace(/\s+/g, '');
  //           str = str.replace(new RegExp(_datum + '(?!\s*,)', 'g'), '<a class="withUnderScore" target="_blank" href="' + links[j] + _number + '">' + _datum + '</a>');
  //           break;
  //         default:
  //           str = str.replace(_datum, '<a class="withUnderScore" target="_blank" href="' + links[j] + _datum + '">' + _datum + '</a>');
  //           break;
  //       }
  //     }
  //   }
  // }
  return str;
};

export function getCancerTypeNameFromOncoTreeType(oncoTreeType: TumorType): string {
  return oncoTreeType.name || oncoTreeType.mainType.name || 'NA';
}

export function reduceObject2Array(data: any) {
  return _.reduce(
    data,
    function(acc, data, key) {
      acc.push({
        name: key,
        count: data
      });
      return acc;
    },
    [] as any
  );
}

export function match2KeyLevel(level: string) {
  return _.replace(level, new RegExp('[AB]'), '');
}
