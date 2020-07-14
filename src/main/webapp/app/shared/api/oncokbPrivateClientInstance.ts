import OncoKbPrivateAPI from './generated/OncoKbPrivateAPI';

let devUrl = localStorage.getItem('localdev');
if (devUrl !== null) devUrl += '/';
else devUrl = '';

const privateClient = new OncoKbPrivateAPI(devUrl + 'api/private');

export default privateClient;
