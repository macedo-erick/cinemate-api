import axios from 'axios';
import { config } from 'dotenv';

config();

const BaseService = () => {
  const apiKey = process.env.API_KEY;

  const instance = axios.create({
    baseURL: 'https://www.omdbapi.com',
    params: { apiKey },
  });

  return {
    instance,
  };
};
export default BaseService;
