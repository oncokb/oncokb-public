import API from './generated/API';
import { dev } from '../../config/constants';

const client = new API(dev);

export default client;
