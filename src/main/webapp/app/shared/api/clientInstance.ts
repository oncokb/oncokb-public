import API from './generated/API';

import { getClientInstanceURL } from '../utils/DevUtils';

const client = new API(getClientInstanceURL(''));

export default client;
