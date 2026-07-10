const XSRF_TOKEN_COOKIE = 'XSRF-TOKEN';
export const XSRF_TOKEN_HEADER = 'X-XSRF-TOKEN';

export function getXsrfToken() {
  const cookie = document.cookie
    .split(';')
    .map(item => item.trim())
    .find(item => item.startsWith(`${XSRF_TOKEN_COOKIE}=`));

  if (!cookie) {
    return undefined;
  }

  return decodeURIComponent(cookie.substring(XSRF_TOKEN_COOKIE.length + 1));
}
