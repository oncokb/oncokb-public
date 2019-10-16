import OncoKbAPI from './generated/OncoKbAPI';

const client = new OncoKbAPI('http://localhost:9095/api/v1');

export default client;
