import OncoKbPrivateAPI from './generated/OncoKbPrivateAPI';
import { getClientInstanceURL } from '../utils/DevUtils';

const privateClient = new OncoKbPrivateAPI(getClientInstanceURL('api/private'));

export default privateClient;
