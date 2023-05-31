/* eslint-disable no-shadow */
import NodeCache from 'node-cache';
import BaseService from './base.service.js';
import LoggerService from './logger.service.js';

const MovieService = () => {
  const cache = new NodeCache();
  const MAX_CACHE_TIMEOUT = 3600;
  const loggerService = LoggerService('movie.service');

  const transformOMDBData = (movie) => ({
    title: movie.Title,
    releasedDate: movie.Released,
    genres: movie.Genre.split(', '),
    director: movie.Director.split(', '),
    writer: movie.Writer,
    actors: movie.Actors,
    synopsis: movie.Plot,
    languages: movie.Language.split(', '),
    country: movie.Country,
    poster: movie.Poster,
    rating: movie.imdbRating,
    year: movie.Year,
    imdbId: movie.imdbID,
  });

  const transformTMDBData = (movie) => ({
    title: movie.title,
    synopsis: movie.overview,
    poster: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
    year: movie.release_date.replace(/(\d{4})(.*)/, '$1'),
    releasedDate: new Date(movie.release_date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }),
    imdbId: movie.imdb_id,
    languages: movie.spoken_languages.map((l) => l.english_name),
    genres: movie.genres.map((g) => g.name),
    runtime: movie.runtime,
    rating: movie.vote_average,
    videos: movie.videos?.results.map((v) => ({
      name: v.name,
      link: `https://www.youtube.com/watch?v=${v.key}`,
    })),
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

      const movie = transformOMDBData(data);

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
      loggerService.info('Trying to retrieve upcoming movies');

      if (cache.has('upcoming')) {
        loggerService.info('Found cached information for upcoming movies');
        return res.send(cache.get('upcoming'));
      }

      loggerService.info('No cached information found for upcoming movies');

      const { data } = await BaseService.tmdbService.get('/discover/movie', {
        params: {
          include_adult: false,
          include_video: false,
          language: 'en-US',
          page: 1,
          'primary_release_date.gte': new Date(),
          sort_by: 'popularity.desc',
        },
      });

      const movies = await Promise.all(
        data.results.map(async (r) => {
          const { data } = await BaseService.tmdbService.get(`/movie/${r.id}`);
          return transformTMDBData(data);
        }),
      );

      cache.set('upcoming', movies, MAX_CACHE_TIMEOUT);

      return res.send(movies);
    } catch (error) {
      return res.status(500).send(error);
    }
  };

  const getPopularMovies = async (req, res) => {
    try {
      loggerService.info('Trying to retrieve popular movies');

      if (cache.has('popular')) {
        loggerService.info('Found cached information for popular movies');
        return res.send(cache.get('popular'));
      }

      loggerService.info('No cached information found for popular movies');

      const { data } = await BaseService.tmdbService.get('/movie/popular');

      const movies = await Promise.all(
        data.results.map(async (r) => {
          const { data } = await BaseService.tmdbService.get(`/movie/${r.id}`);
          return transformTMDBData(data);
        }),
      );

      cache.set('popular', movies, MAX_CACHE_TIMEOUT);

      return res.send(movies);
    } catch (error) {
      return res.status(500).send(error);
    }
  };

  const getMovieDetail = async (req, res) => {
    try {
      const { imdbId } = req.params;

      const { title } = await getMovieInfo(imdbId);

      const queryResult = await BaseService.tmdbService.get('/search/movie', {
        params: { query: title },
      });

      const { data } = await BaseService.tmdbService.get(
        `/movie/${queryResult.data.results[0].id}`,
        { params: { append_to_response: 'videos' } },
      );

      const movie = transformTMDBData(data);

      cache.set(imdbId, movie);

      return res.send(movie);
    } catch (error) {
      return res.status(500).send(error);
    }
  };

  return {
    getMovies,
    getUpcomingMovies,
    getPopularMovies,
    getMovieDetail,
  };
};

export default MovieService();
