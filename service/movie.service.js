import NodeCache from 'node-cache';
import BaseService from './base.service.js';
import LoggerService from './logger.service.js';
import TranslateService from './translate.service.js';

const MovieService = () => {
  const cache = new NodeCache();

  const loggerService = LoggerService('movie.service.js');

  const transformData = async (movie) => ({
    title: movie.Title,
    releasedDate: movie.Released,
    genre: await TranslateService.translate(movie.Genre),
    director: movie.Director,
    writer: movie.Writer,
    actors: movie.Actors,
    synopsis: await TranslateService.translate(movie.Plot),
    languages: await TranslateService.translate(movie.Language, true),
    country: await TranslateService.translate(movie.Country),
    poster: movie.Poster,
    rating: movie.imdbRating,
  });

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

        return res.send(cache.get(movieName.concat(page))).status(200);
      }

      loggerService.info(
        'No cached information found for name [%s] and page [%d]',
        movieName,
        page,
      );

      const { data, status } = await BaseService.get('', {
        params: { s: movieName, page },
      });

      if (data.Error) throw data.Error;

      const { Search, totalResults } = data;

      const response = {
        content: Search.map((m) => ({
          title: m.Title,
          year: m.Year,
          imdbId: m.imdbID,
          type: m.Type,
          poster: m.Poster,
        })),
        pages: Math.ceil(parseInt(totalResults, 10) / 10),
        actualPage: parseInt(page, 10),
        totalResults: parseInt(totalResults, 10),
      };

      if (movieName) cache.set(movieName.concat(page), response, 30);

      return res.send(response).status(status);
    } catch (error) {
      return res
        .send({ message: 'Something went wrong', status: 500, error })
        .status(500);
    }
  };

  const getMovie = async (req, res) => {
    const { omdbId } = req.params;

    loggerService.info('Trying to retrieve movie for omdb id [%s]', omdbId);

    try {
      if (cache.has(omdbId)) {
        loggerService.info('Found cached information for omdb id [%s]', omdbId);

        return res.send(cache.get(omdbId)).status(200);
      }

      loggerService.info(
        'No cached information found information for omdb id [%s]',
        omdbId,
      );

      const { data, status } = await BaseService.get('', {
        params: { i: omdbId, plot: 'full' },
      });

      const movie = await transformData(data);

      if (omdbId) cache.set(omdbId, movie, 30);

      return res.send(movie).status(status);
    } catch (error) {
      return res.send(error).status(500);
    }
  };

  return {
    getMovies,
    getMovie,
  };
};

export default MovieService();
