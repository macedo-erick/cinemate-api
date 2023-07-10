/* eslint-disable implicit-arrow-linebreak */
import axios from 'axios';
import { config } from 'dotenv';

config();

const apiKey = process.env.API_KEY;

const BaseService = () =>
  axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: { Authorization: `Bearer ${apiKey}` },
  });

export default BaseService();
