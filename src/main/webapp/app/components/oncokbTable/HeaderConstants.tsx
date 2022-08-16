import React from 'react';
import { ToggleValue } from 'app/pages/usageAnalysisPage/UsageAnalysisPage';

export const emailHeader = <span>Email</span>;
export const usageHeader = <span>Usage</span>;
export const resourceHeader = <span>Resource</span>;
export const endpointHeader = <span>Most frequently used endpoint</span>;
export const noPrivateEndpointHeader = (
  <span>Most frequently used endpoint(only public)</span>
);
export const timeHeader = <span>Time</span>;
export const operationHeader = <span>Details</span>;

export const filterDependentTimeHeader = (timeTypeToggleValue: ToggleValue) => {
  return (
    <span>
      {timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL
        ? 'Duration'
        : 'Time'}
    </span>
  );
};
export const filterDependentResourceHeader = (
  resourcesTypeToggleValue: ToggleValue
) => {
  return (
    <span>
      Resource{' '}
      {resourcesTypeToggleValue === ToggleValue.PUBLIC_RESOURCES
        ? '(only public)'
        : null}
    </span>
  );
};
