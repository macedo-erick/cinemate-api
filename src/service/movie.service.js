/* eslint-disable no-shadow,operator-linebreak,camelcase */
import NodeCache from 'node-cache';
import BaseService from './base.service.js';
import LoggerService from './logger.service.js';
import UTILS from '../util/util.js';

const MovieService = () => {
  const cache = new NodeCache();
  const loggerService = LoggerService('movie.service');

  const getFullPosterURL = (path) => {
    if (path) {
      return `https://image.tmdb.org/t/p/original${path}`;
    }

    return UTILS.NO_POSTER_URL;
  };

  const formatReleaseDate = (date) => {
    if (!date) return '0000';

    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const convertMovieResponse = (movie) => {
    const posterURL = getFullPosterURL(movie.poster_path);
    const releaseYear = movie.release_date ? movie.release_date.replace(/(\d{4})(.*)/, '$1') : '';
    const releaseDate = formatReleaseDate(movie.release_date);

    return {
      id: movie.id,
      title: movie.title,
      synopsis: movie.overview,
      poster: posterURL,
      year: releaseYear,
      releasedDate: releaseDate,
      languages: movie.spoken_languages.map(({ english_name }) => english_name),
      genres: movie.genres.map(({ name }) => name),
      runtime: movie.runtime,
      rating: movie.vote_average,
    };
  };

  const getMovieDetail = async (id) => {
    loggerService.info('Trying to retrieve movie for id [%s]', id);

    if (cache.has(id)) {
      loggerService.info('Found cached information for id [%s]', id);

      return cache.get(id);
    }

    loggerService.info('No cached information found for id [%d]', id);

    const { data } = await BaseService.get(`/movie/${id}`, {
      params: { append_to_response: 'videos' },
    });

    const movie = convertMovieResponse(data);

    cache.set(id, movie);

    return movie;
  };

  const convertResponse = async (data) => {
    const movies = await Promise.all(
      data.results.map((r) => getMovieDetail(r.id)),
    );

    return {
      results: movies,
      totalPages: data.total_pages,
      page: data.page,
      totalResults: data.total_results,
    };
  };

  const resolveAvatarURL = (avatar) => {
    if (avatar) {
      return avatar.includes('secure')
        ? avatar.substring(1)
        : `https://image.tmdb.org/t/p/original${avatar}`;
    }

    return '';
  };

  const getMovies = async (query, page) => {
    loggerService.info('Trying to retrieve movies for name [%s]', query);

    if (cache.has(query.concat(page))) {
      loggerService.info(
        'Found cached information for name [%s] and page [%d]',
        query,
        page,
      );

      return cache.get(query.concat(page));
    }

    loggerService.info(
      'No cached information found for name [%s] and page [%d]',
      query,
      page,
    );

    const { data } = await BaseService.get('/search/movie', {
      params: { query, page, include_adult: false },
    });

    const response = await convertResponse(data);

    if (query && page) {
      cache.set(query.concat(page), response, UTILS.MAX_CACHE_TIMEOUT);
    }

    return response;
  };

  const getUpcomingMovies = async () => {
    loggerService.info('Trying to retrieve upcoming movies');

    if (cache.has('upcoming')) {
      loggerService.info('Found cached information for upcoming movies');

      return cache.get('upcoming');
    }

    loggerService.info('No cached information found for upcoming movies');

    const { data } = await BaseService.get('/discover/movie', {
      params: {
        include_adult: false,
        include_video: false,
        language: 'en-US',
        page: 1,
        'primary_release_date.gte': new Date(),
        sort_by: 'popularity.desc',
      },
    });

    const response = await convertResponse(data);

    cache.set('upcoming', response, UTILS.MAX_CACHE_TIMEOUT);

    return response;
  };

  const getPopularMovies = async () => {
    loggerService.info('Trying to retrieve popular movies');

    if (cache.has('popular')) {
      loggerService.info('Found cached information for popular movies');

      return cache.get('popular');
    }

    loggerService.info('No cached information found for popular movies');

    const { data } = await BaseService.get('/movie/popular');

    const response = await convertResponse(data);

    cache.set('popular', response, UTILS.MAX_CACHE_TIMEOUT);

    return response;
  };

  const getRelatedMovies = async (id) => {
    loggerService.info('Trying to retrieve related movies for id [%d]', id);

    if (cache.has(`related-${id}`)) {
      loggerService.info('Found cached related movies for id [%d]', id);

      return cache.get(`related-${id}`);
    }

    loggerService.info('No cached information found for id [%id]', id);

    const { data } = await BaseService.get(`/movie/${id}/similar`);

    const response = await convertResponse(data);

    cache.set(`related-${id}`, response);

    return response;
  };

  const getMovieVideos = async (id) => {
    loggerService.info('Trying to retrieve videos for id [%d]', id);

    if (cache.has(`video-${id}`)) {
      loggerService.info('Found cached videos for id [%d]', id);

      return cache.get(`video-${id}`);
    }

    loggerService.info('No cached information found for id [%d]', id);

    const { data } = await BaseService.get(`/movie/${id}/videos`);

    const response = data.results.map((v) => ({
      name: v.name,
      video: `https://www.youtube.com/embed/${v.key}`,
      thumbnail: `https://i3.ytimg.com/vi/${v.key}/maxresdefault.jpg`,
    }));

    cache.set(`video-${id}`, response);

    return response;
  };

  const getMovieReviews = async (id) => {
    loggerService.info('Trying to retrieve reviews for id [%d]', id);

    if (cache.has(`review-${id}`)) {
      loggerService.info('Found cached reviews for id [%d]', id);

      return cache.get(`review-${id}`);
    }

    loggerService.info('No cached information found for id [%d]', id);

    const { data } = await BaseService.get(`/movie/${id}/reviews`);

    const response = data.results.map(
      ({ author_details, content, created_at }) => ({
        author: author_details.name || author_details.username,
        avatar: resolveAvatarURL(author_details.avatar_path),
        rating: author_details.rating,
        createdDate: created_at,
        content,
      }),
    );

    cache.set(`review-${id}`, response);

    return response;
  };

  return {
    getMovies,
    getUpcomingMovies,
    getPopularMovies,
    getMovieDetail,
    getRelatedMovies,
    getMovieVideos,
    getMovieReviews,
  };
};

export default MovieService();
