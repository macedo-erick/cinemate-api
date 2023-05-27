import express from 'express';
import MovieService from '../service/movie.service.js';

const route = express.Router();

route.get('', (req, res) => MovieService.getMovies(req, res));
route.get('/:omdbId', (req, res) => MovieService.getMovie(req, res));

export default route;
