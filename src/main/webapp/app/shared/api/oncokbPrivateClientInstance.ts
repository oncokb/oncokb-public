import OncoKbPrivateAPI from './generated/OncoKbPrivateAPI';

const privateClient = new OncoKbPrivateAPI('http://localhost:9095/api/private');

export default privateClient;
