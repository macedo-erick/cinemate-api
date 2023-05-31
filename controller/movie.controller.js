/* eslint-disable implicit-arrow-linebreak,function-paren-newline */
import express from 'express';
import MovieService from '../service/movie.service.js';

const route = express.Router();

route.get('', (req, res) => MovieService.getMovies(req, res));
route.get('/upcoming', (req, res) => MovieService.getUpcomingMovies(req, res));
route.get('/popular', (req, res) => MovieService.getPopularMovies(req, res));
route.get('/detail/:imdbId', (req, res) =>
  MovieService.getMovieDetail(req, res),
);

export default route;
