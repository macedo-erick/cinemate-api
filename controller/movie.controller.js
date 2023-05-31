/* eslint-disable implicit-arrow-linebreak,function-paren-newline */
import express from 'express';
import MovieService from '../service/movie.service.js';

const route = express.Router();

route.get('', async (req, res) => {
  try {
    const { query, page } = req.query;

    const data = await MovieService.getMovies(query, page);

    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/upcoming', async (req, res) => {
  try {
    const data = await MovieService.getUpcomingMovies();

    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/popular', async (req, res) => {
  try {
    const data = await MovieService.getPopularMovies(req, res);

    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const data = await MovieService.getMovieDetail(id);

    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;

    const data = await MovieService.getRelatedMovies(id);

    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get('/:id/videos', async (req, res) => {
  try {
    const { id } = req.params;

    const data = await MovieService.getMovieVideos(id);

    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default route;
