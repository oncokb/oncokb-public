import React from 'react';

function getUsageTextClassName(usage: number | undefined) {
  if (usage >= 1000000000) {
    return 'text-danger';
  } else if (usage >= 1000000) {
    return 'text-warning';
  } else {
    return '';
  }
}

const UsageText: React.FunctionComponent<{
  usage: number | undefined;
}> = ({ usage }) => {
  return (
    <span className={getUsageTextClassName(usage)}>
      {usage?.toLocaleString() ?? 'N/A'}
    </span>
  );
};

export default UsageText;
