import OncoKbAPI from './generated/OncoKbAPI';
import { getClientInstanceURL } from '../utils/DevUtils';

const client = new OncoKbAPI(getClientInstanceURL('api/v1'));

export default client;
