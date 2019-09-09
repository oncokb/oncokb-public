export function isAuthorized(userAuthorities: string[], hasAnyAuthorities: string[]) {
  if (userAuthorities && userAuthorities.length !== 0) {
    if (hasAnyAuthorities.length === 0) {
      return true;
    }
    return hasAnyAuthorities.some(auth => userAuthorities.includes(auth));
  }
  return false;
}
