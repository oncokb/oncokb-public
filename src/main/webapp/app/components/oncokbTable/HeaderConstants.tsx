import React from 'react';
import { ToggleValue } from 'app/pages/usageAnalysisPage/UsageAnalysisPage';

export const emailHeader = 'Email';
export const usageHeader = 'Usage';
export const resourceHeader = 'Resource';
export const endpointHeader = 'Most frequently used endpoint';
export const noPrivateEndpointHeader =
  'Most frequently used endpoint (only public)';
export const timeHeader = 'Time';
export const operationHeader = 'Details';

export const filterDependentTimeHeader = (timeTypeToggleValue: ToggleValue) => {
  return timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL
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
