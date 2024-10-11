import React from 'react';
import { ToggleValue } from 'app/pages/usageAnalysisPage/usage-analysis-utils';

export const emailHeader = 'Email';
export const usageHeader = 'Usage';
export const resourceHeader = 'Resource';
export const endpointHeader = 'Most frequently used endpoint';
export const publicEndpointHeader =
  'Most frequently used endpoint (only public)';
export const timeHeader = 'Time';
export const operationHeader = 'Details';

export const filterDependentTimeHeader = (timeTypeToggleValue: ToggleValue) => {
  return timeTypeToggleValue === ToggleValue.RESULTS_BY_YEAR
    ? 'Duration'
    : 'Time';
};
export const filterDependentResourceHeader = (
  resourcesTypeToggleValue: ToggleValue
) => {
  return (
    'Resource' +
    (resourcesTypeToggleValue === ToggleValue.PUBLIC_RESOURCES
      ? ' (only public)'
      : '')
  );
};
