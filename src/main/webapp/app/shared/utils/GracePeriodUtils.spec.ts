import {
  getGracePeriodAccessDaysRemaining,
  getGracePeriodWindowDaysRemaining,
  hasGracePeriodAccess,
} from 'app/shared/utils/GracePeriodUtils';

describe('GracePeriodUtils', () => {
  it('returns active grace-period access for pending users in the window', () => {
    const user = {
      activated: false,
      accountRequestStatus: 'PENDING' as const,
      activationGracePeriodDaysRemaining: 12,
    };

    expect(hasGracePeriodAccess(user)).toBe(true);
    expect(getGracePeriodAccessDaysRemaining(user)).toBe(12);
    expect(getGracePeriodWindowDaysRemaining(user)).toBe(12);
  });

  it('keeps the grace-period window for pending users without grace-period access', () => {
    const user = {
      activated: false,
      accountRequestStatus: 'PENDING_NO_GRACE_PERIOD' as const,
      activationGracePeriodDaysRemaining: 12,
    };

    expect(hasGracePeriodAccess(user)).toBe(false);
    expect(getGracePeriodAccessDaysRemaining(user)).toBe(0);
    expect(getGracePeriodWindowDaysRemaining(user)).toBe(12);
  });

  it('returns zero for activated users or expired windows', () => {
    expect(
      getGracePeriodWindowDaysRemaining({
        activated: true,
        accountRequestStatus: 'PENDING',
        activationGracePeriodDaysRemaining: 10,
      })
    ).toBe(0);

    expect(
      getGracePeriodWindowDaysRemaining({
        activated: false,
        accountRequestStatus: 'PENDING',
        activationGracePeriodDaysRemaining: 0,
      })
    ).toBe(0);
  });
});
