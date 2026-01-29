import React from 'react';
import { Badge } from 'react-bootstrap';
import classNames from 'classnames';
import { UserBannerMessageDTO } from 'app/shared/api/generated/API';

export type UserBannerStatusBadgeProps = {
  status?: UserBannerMessageDTO['status'];
  className?: string;
};

function formatStatusLabel(status?: UserBannerMessageDTO['status']) {
  if (!status) {
    return 'Unknown';
  }
  const lowerStatus = status.toLowerCase();
  return lowerStatus.charAt(0).toUpperCase() + lowerStatus.slice(1);
}

function getStatusVariant(status?: UserBannerMessageDTO['status']) {
  switch (status) {
    case 'EXPIRED':
      return 'danger';
    case 'SCHEDULED':
      return 'info';
    case 'ACTIVE':
      return 'success';
    default:
      return 'secondary';
  }
}

export function UserBannerStatusBadge({
  status,
  className,
}: UserBannerStatusBadgeProps) {
  return (
    <Badge
      variant={getStatusVariant(status)}
      className={classNames('text-uppercase', className)}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}
