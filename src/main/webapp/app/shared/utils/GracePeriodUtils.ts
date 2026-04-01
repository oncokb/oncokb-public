import { UserDTO } from 'app/shared/api/generated/API';

// Active grace-period access is narrower than eligibility: it only applies to
// pending users whose temporary access has not been revoked.
export function hasGracePeriodAccess(
  user?: Pick<
    UserDTO,
    'activated' | 'accountRequestStatus' | 'activationGracePeriodDaysRemaining'
  >
): boolean {
  return (
    !user?.activated &&
    (user?.activationGracePeriodDaysRemaining ?? 0) > 0 &&
    user?.accountRequestStatus === 'PENDING'
  );
}

// This is the user-facing remaining time for users who currently have
// temporary grace-period access.
export function getGracePeriodDaysRemaining(
  user?: Pick<
    UserDTO,
    'activated' | 'accountRequestStatus' | 'activationGracePeriodDaysRemaining'
  >
): number {
  return hasGracePeriodAccess(user)
    ? user?.activationGracePeriodDaysRemaining ?? 0
    : 0;
}
