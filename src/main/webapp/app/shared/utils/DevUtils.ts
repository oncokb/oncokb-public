import { LOCAL_DEV_OPT, DEV_URL } from '../../config/constants';

export function getClientInstanceURL(url: string) {
  if (localStorage.getItem(LOCAL_DEV_OPT) === 'true') {
    return url ? `${DEV_URL}/${url}` : DEV_URL;
  } else {
    return url;
  }
}
