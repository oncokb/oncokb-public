import { UserDTO } from 'app/shared/api/generated/API';

type GracePeriodAccountRequestStatus =
  | 'PENDING'
  | 'PENDING_NO_GRACE_PERIOD'
  | undefined;

function getGracePeriodAccountRequestStatus(
  user?: Pick<UserDTO, 'accountRequestStatus'>
): GracePeriodAccountRequestStatus {
  if (
    user?.accountRequestStatus === 'PENDING' ||
    user?.accountRequestStatus === 'PENDING_NO_GRACE_PERIOD'
  ) {
    return user.accountRequestStatus;
  }

  return undefined;
}

export function getGracePeriodWindowDaysRemaining(
  user?: Pick<
    UserDTO,
    'activated' | 'accountRequestStatus' | 'activationGracePeriodDaysRemaining'
  >
): number {
  const accountRequestStatus = getGracePeriodAccountRequestStatus(user);
  const activationGracePeriodDaysRemaining =
    user?.activationGracePeriodDaysRemaining ?? 0;

  if (user?.activated || !accountRequestStatus) {
    return 0;
  }

  return Math.max(0, activationGracePeriodDaysRemaining);
}

export function hasGracePeriodAccess(
  user?: Pick<
    UserDTO,
    'activated' | 'accountRequestStatus' | 'activationGracePeriodDaysRemaining'
  >
): boolean {
  return (
    getGracePeriodWindowDaysRemaining(user) > 0 &&
    user?.accountRequestStatus === 'PENDING'
  );
}

export function getGracePeriodAccessDaysRemaining(
  user?: Pick<
    UserDTO,
    'activated' | 'accountRequestStatus' | 'activationGracePeriodDaysRemaining'
  >
): number {
  return hasGracePeriodAccess(user)
    ? getGracePeriodWindowDaysRemaining(user)
    : 0;
}
