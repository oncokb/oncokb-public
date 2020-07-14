import OncoKbPrivateAPI from './generated/OncoKbPrivateAPI';
import { dev } from '../../config/constants';

let preURL = '';
if (dev.length > 0) preURL = dev + '/';
const privateClient = new OncoKbPrivateAPI(preURL + 'api/private');

export default privateClient;
