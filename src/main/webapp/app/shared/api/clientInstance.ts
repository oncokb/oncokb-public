import API from './generated/API';

let devUrl = localStorage.getItem('localdev');
if (devUrl === null) devUrl = '';

const client = new API(devUrl);

export default client;
