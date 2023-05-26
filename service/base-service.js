import axios from 'axios';
import { config } from 'dotenv';

config();

const apiKey = process.env.API_KEY;

const axiosInstance = axios.create({
  baseURL: `https://www.omdbapi.com/?apikey=${apiKey}`,
});

export default axiosInstance;
