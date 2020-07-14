import OncoKbAPI from './generated/OncoKbAPI';
import { dev } from '../../config/constants';

let preURL = '';
if (dev.length > 0) preURL = dev + '/';
const client = new OncoKbAPI(preURL + 'api/v1');

export default client;
