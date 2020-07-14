import { LOCAL_DEV_OPT } from '../../config/constants';

export function getClientInstanceURL(url: string) {
  let devURL = localStorage.getItem(LOCAL_DEV_OPT) || '';

  if (devURL.length > 0 && url.length > 0) devURL += '/';

  return devURL + url;
}
