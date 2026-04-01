import {
  getGracePeriodDaysRemaining,
  hasGracePeriodAccess,
} from 'app/shared/utils/GracePeriodUtils';

describe('GracePeriodUtils', () => {
  it('returns active grace-period access and remaining days for pending users', () => {
    const user = {
      activated: false,
      accountRequestStatus: 'PENDING' as const,
      activationGracePeriodDaysRemaining: 12,
    };

    expect(hasGracePeriodAccess(user)).toBe(true);
    expect(getGracePeriodDaysRemaining(user)).toBe(12);
  });

  it('returns no active grace-period access when the grace period was revoked', () => {
    const user = {
      activated: false,
      accountRequestStatus: 'PENDING_NO_GRACE_PERIOD' as const,
      activationGracePeriodDaysRemaining: 12,
    };

    expect(hasGracePeriodAccess(user)).toBe(false);
    expect(getGracePeriodDaysRemaining(user)).toBe(0);
  });

  it('returns no active grace-period access for activated users or expired grace periods', () => {
    expect(
      getGracePeriodDaysRemaining({
        activated: true,
        accountRequestStatus: 'PENDING',
        activationGracePeriodDaysRemaining: 10,
      })
    ).toBe(0);

    expect(
      getGracePeriodDaysRemaining({
        activated: false,
        accountRequestStatus: 'PENDING',
        activationGracePeriodDaysRemaining: 0,
      })
    ).toBe(0);
  });
});
