/* eslint-disable max-len,import/extensions,no-console */
import NodeCache from 'node-cache';
import express from 'express';
import service from './service/base-service.js';
import logger from './config/logger.js';

const app = express();
const cache = new NodeCache();

app.get('/movies', async (req, res) => {
  const { movieName, page } = req.query;

  logger.log('info', 'Trying to retrieve movies for name [%s]', movieName);

  if (cache.has(movieName.concat(page))) {
    logger.log(
      'info',
      'Found cached information for name [%s] and page [%d]',
      movieName,
      page,
    );

    return res.send(cache.get(movieName.concat(page))).status(200);
  }

  logger.log(
    'info',
    'No cached information found for name [%s] and page [%d]',
    movieName,
    page,
  );

  const axiosResponse = await service.get('', {
    params: { s: movieName, page: page || 1 },
  });

  if (movieName) cache.set(movieName.concat(page), axiosResponse.data, 30);

  return res.send(axiosResponse.data).status(axiosResponse.status);
});

app.listen(process.env.API_PORT, () => {
  console.log(
    '\n'
      + '\n'
      + '____    __    ____  _______  __        ______   ______   .___  ___.  _______ \n'
      + '\\   \\  /  \\  /   / |   ____||  |      /      | /  __  \\  |   \\/   | |   ____|\n'
      + " \\   \\/    \\/   /  |  |__   |  |     |  ,----'|  |  |  | |  \\  /  | |  |__   \n"
      + '  \\            /   |   __|  |  |     |  |     |  |  |  | |  |\\/|  | |   __|  \n'
      + "   \\    /\\    /    |  |____ |  `----.|  `----.|  `--'  | |  |  |  | |  |____ \n"
      + '    \\__/  \\__/     |_______||_______| \\______| \\______/  |__|  |__| |_______|\n'
      + '                                                                             \n'
      + '  ______   .___  ___.  _______  .______           ___      .______    __     \n'
      + ' /  __  \\  |   \\/   | |       \\ |   _  \\         /   \\     |   _  \\  |  |    \n'
      + '|  |  |  | |  \\  /  | |  .--.  ||  |_)  |       /  ^  \\    |  |_)  | |  |    \n'
      + '|  |  |  | |  |\\/|  | |  |  |  ||   _  <       /  /_\\  \\   |   ___/  |  |    \n'
      + "|  `--'  | |  |  |  | |  '--'  ||  |_)  |     /  _____  \\  |  |      |  |    \n"
      + ' \\______/  |__|  |__| |_______/ |______/     /__/     \\__\\ | _|      |__|    \n'
      + '                                                                             \n'
      + '\n',
  );
  logger.log('info', 'App listening on port %d', process.env.API_PORT);
});
