import React from 'react';
import {
  ITextBreadcrumb,
  ILinkBreadcrumb,
  IDropdownBreadcrumb,
  IInputBreadcrumb,
  AnnotationBreadcrumbs,
} from 'app/pages/annotationPage/AnnotationBreadcrumbs';
import { getAlterationPageLink, getGenePageLink } from '../utils/UrlUtils';

export default function SomaticGermlineBreadcrumbs({
  hugoSymbol,
  alterationNameWithDiff,
  alterationName,
  cancerTypeName,
  germline,
  isTag = false,
}: {
  hugoSymbol: string;
  alterationNameWithDiff: string;
  alterationName: string;
  cancerTypeName: string | undefined;
  germline?: boolean;
  isTag?: boolean;
}) {
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
      }),
    } as ILinkBreadcrumb,
  ];

  if (cancerTypeName) {
    breadcrumbs.push({
      type: 'text',
      text: cancerTypeName,
      key: 'cancertype',
    } as ITextBreadcrumb);
  }

  return <AnnotationBreadcrumbs breadcrumbs={breadcrumbs} />;
}
