import OncoKbAPI from './generated/OncoKbAPI';

let devUrl = localStorage.getItem('localdev');
if (devUrl !== null) devUrl += '/';
else devUrl = '';

const client = new OncoKbAPI(devUrl + 'api/v1');

export default client;
