/* eslint-disable */
import NodeCache from 'node-cache';
import BaseService from './base.service.js';
import LoggerService from './logger.service.js';

const MovieService = () => {
  const cache = new NodeCache();
  const MAX_CACHE_TIMEOUT = 3600;
  const loggerService = LoggerService('movie.service');

  const transformData = (movie) => ({
    title: movie.Title,
    releasedDate: movie.Released,
    genre: movie.Genre.split(', '),
    director: movie.Director.split(', '),
    writer: movie.Writer,
    actors: movie.Actors,
    synopsis: movie.Plot,
    languages: movie.Language,
    country: movie.Country,
    poster: movie.Poster,
    rating: movie.imdbRating,
    year: movie.Year,
    imdbId: movie.imdbID,
  });

  const getMovieInfo = async (imdbId) => {
    loggerService.info('Trying to retrieve movie for omdb id [%s]', imdbId);

    try {
      if (cache.has(imdbId)) {
        loggerService.info('Found cached information for omdb id [%s]', imdbId);

        return cache.get(imdbId);
      }

      loggerService.info(
        'No cached information found information for omdb id [%s]',
        imdbId,
      );

      const { data } = await BaseService.omdbService.get('', {
        params: { i: imdbId, plot: 'full' },
      });

      if (data.Error) throw data.Error;

      const movie = transformData(data);

      if (imdbId) {
        cache.set(imdbId, movie, MAX_CACHE_TIMEOUT);
      }

      return movie;
    } catch (error) {
      return error;
    }
  };

  const getMovies = async (req, res) => {
    const { movieName, page } = req.query;

    loggerService.info('Trying to retrieve movies for name [%s]', movieName);

    try {
      if (cache.has(movieName.concat(page))) {
        loggerService.info(
          'Found cached information for name [%s] and page [%d]',
          movieName,
          page,
        );

        return res.send(cache.get(movieName.concat(page)));
      }

      loggerService.info(
        'No cached information found for name [%s] and page [%d]',
        movieName,
        page,
      );

      const { data, status, Error } = await BaseService.omdbService.get('', {
        params: { s: movieName, type: 'movie', page },
      });

      if (Error) throw Error;

      const { Search, totalResults } = data;

      const movies = await Promise.all(
        Search.map((m) => getMovieInfo(m.imdbID)),
      );

      const response = {
        content: movies,
        pages: Math.ceil(parseInt(totalResults, 10) / 10),
        actualPage: parseInt(page, 10),
        totalResults: parseInt(totalResults, 10),
      };

      if (movieName) {
        cache.set(movieName.concat(page), response, MAX_CACHE_TIMEOUT);
      }

      return res.send(response).status(status);
    } catch (error) {
      return res.status(400).send({ error });
    }
  };

  const getUpcomingMovies = async (req, res) => {
    try {
      if (cache.has('upcoming')) {
        return res.send(cache.get('upcoming'));
      }

      const { data } = await BaseService.tmdbService.get('/upcoming');

      const movieInfos = await Promise.all(
        data.results.map(async (r) => {
          const { data } = await BaseService.tmdbService.get(`/${r.id}`);
          return await getMovieInfo(data.imdb_id);
        }),
      );

      cache.set('upcoming', movieInfos, MAX_CACHE_TIMEOUT)

      return res.send(movieInfos);
    } catch (error) {
      return res.status(500).send(error);
    }
  };

  const getPopularMovies = async (req, res) => {
    try {
      if (cache.has('popular')) {
        return res.send(cache.get('popular'))
      }

      const { data } = await BaseService.tmdbService.get('/popular');

      const movieInfos = await Promise.all(
        data.results.map(async (r) => {
          const { data } = await BaseService.tmdbService.get(`/${r.id}`);
          return await getMovieInfo(data.imdb_id);
        }),
      );

      cache.set('popular', movieInfos, MAX_CACHE_TIMEOUT)

      return res.send(movieInfos);
    } catch (error) {
      return res.status(500).send(error);
    }
  };

  return {
    getMovies,
    getUpcomingMovies,
    getPopularMovies,
  };
};

export default MovieService();
