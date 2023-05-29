import axios from 'axios';
import { config } from 'dotenv';

config();

const apiKey = process.env.API_KEY;
const apiToken = process.env.API_TOKEN;

const BaseService = () => {
  const omdbService = axios.create({
    baseURL: 'https://www.omdbapi.com',
    params: { apiKey },
  });

  const tmdbService = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: { Authorization: `Bearer ${apiToken}` },
  });

  return {
    omdbService,
    tmdbService,
  };
};

export default BaseService();
