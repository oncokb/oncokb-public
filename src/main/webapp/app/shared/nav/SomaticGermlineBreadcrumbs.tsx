import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  ITextBreadcrumb,
  ILinkBreadcrumb,
  IDropdownBreadcrumb,
  IInputBreadcrumb,
  AnnotationBreadcrumbs,
} from 'app/pages/annotationPage/AnnotationBreadcrumbs';
import {
  getAlterationPageLink,
  getGenePageLink,
  getReferenceGenomeFromSearch,
} from '../utils/UrlUtils';
import { REFERENCE_GENOME } from 'app/config/constants';
import { Option } from 'app/shared/select/FormSelectWithLabelField';

export default function SomaticGermlineBreadcrumbs({
  hugoSymbol,
  alterationNameWithDiff,
  alterationName,
  cancerTypeName,
  germline,
  isTag = false,
  selectedReferenceGenome,
}: {
  hugoSymbol: string;
  alterationNameWithDiff: string;
  alterationName: string;
  cancerTypeName: string | undefined;
  germline?: boolean;
  isTag?: boolean;
  // When set, a reference genome dropdown is shown first, like on the HGVSg page
  selectedReferenceGenome?: REFERENCE_GENOME;
}) {
  const history = useHistory();
  const referenceGenome = getReferenceGenomeFromSearch(window.location.search);

  const breadcrumbs: (
    | ITextBreadcrumb
    | ILinkBreadcrumb
    | IDropdownBreadcrumb
    | IInputBreadcrumb
  )[] = [
    {
      type: 'link',
      key: 'gene',
      text: hugoSymbol,
      to: getGenePageLink({
        hugoSymbol,
        germline,
        searchQueries: referenceGenome
          ? { refGenome: referenceGenome }
          : undefined,
      }),
    } as ILinkBreadcrumb,
    {
      type: 'link',
      key: 'alteration',
      text: alterationNameWithDiff,
      to: getAlterationPageLink({
        hugoSymbol,
        alteration: alterationName,
        germline,
        isTag,
        searchQueries: referenceGenome
          ? { refGenome: referenceGenome }
          : undefined,
      }),
    } as ILinkBreadcrumb,
  ];

  if (selectedReferenceGenome) {
    breadcrumbs.unshift({
      type: 'dropdown',
      key: 'referenceGenome',
      text: selectedReferenceGenome,
      onChange(selectedOption: Option) {
        history.push(
          getAlterationPageLink({
            hugoSymbol,
            alteration: alterationName,
            cancerType: cancerTypeName,
            germline,
            isTag,
            searchQueries: {
              refGenome: selectedOption.value as REFERENCE_GENOME,
            },
          }) + history.location.hash
        );
      },
      options: [REFERENCE_GENOME.GRCh37, REFERENCE_GENOME.GRCh38],
    } as IDropdownBreadcrumb);
  }

  if (cancerTypeName) {
    breadcrumbs.push({
      type: 'text',
      text: cancerTypeName,
      key: 'cancertype',
    } as ITextBreadcrumb);
  }

  return <AnnotationBreadcrumbs breadcrumbs={breadcrumbs} />;
}
