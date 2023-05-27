import axios from 'axios';
import { config } from 'dotenv';

config();

const apiKey = process.env.API_KEY;

const BaseService = axios.create({
  baseURL: 'https://www.omdbapi.com',
  params: { apiKey },
});

export default BaseService;
